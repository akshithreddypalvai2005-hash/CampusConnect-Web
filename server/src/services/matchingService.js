const Item = require('../models/Item');
const Notification = require('../models/Notification');

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'it', 'was', 'my', 'i', 'this', 'that', 'from'
]);

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

function calculateSimilarity(itemA, itemB) {
  let score = 0;
  const reasons = [];

  // 1. Category match (35 points)
  if (itemA.category && itemB.category && itemA.category.toLowerCase() === itemB.category.toLowerCase()) {
    score += 35;
    reasons.push(`Matching category: ${itemA.category}`);
  }

  // 2. Location match / partial similarity (25 points)
  const locA = (itemA.approximateLocation || '').toLowerCase().trim();
  const locB = (itemB.approximateLocation || '').toLowerCase().trim();
  if (locA && locB) {
    if (locA === locB) {
      score += 25;
      reasons.push(`Exact campus location match: ${itemA.approximateLocation}`);
    } else if (locA.includes(locB) || locB.includes(locA)) {
      score += 15;
      reasons.push(`Close campus vicinity: ${itemA.approximateLocation} ~ ${itemB.approximateLocation}`);
    }
  }

  // 3. Keyword / Title & Description overlap (25 points)
  const tokensA = new Set([...tokenize(itemA.title), ...tokenize(itemA.description)]);
  const tokensB = new Set([...tokenize(itemB.title), ...tokenize(itemB.description)]);

  if (tokensA.size > 0 && tokensB.size > 0) {
    let intersectionCount = 0;
    const matchingWords = [];
    tokensA.forEach((word) => {
      if (tokensB.has(word)) {
        intersectionCount++;
        matchingWords.push(word);
      }
    });

    const unionCount = new Set([...tokensA, ...tokensB]).size;
    const jaccard = unionCount > 0 ? intersectionCount / unionCount : 0;
    const keywordPoints = Math.min(25, Math.round(jaccard * 50) + (intersectionCount > 0 ? 10 : 0));
    score += keywordPoints;

    if (matchingWords.length > 0) {
      reasons.push(`Keyword match on keywords: "${matchingWords.slice(0, 4).join(', ')}"`);
    }
  }

  // 4. Date proximity window (15 points)
  if (itemA.eventDate && itemB.eventDate) {
    const diffTime = Math.abs(new Date(itemA.eventDate) - new Date(itemB.eventDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      score += 15;
      reasons.push(`Reported dates within ${diffDays} day(s)`);
    } else if (diffDays <= 7) {
      score += 10;
      reasons.push(`Reported dates within 1 week (${diffDays} days)`);
    } else if (diffDays <= 14) {
      score += 5;
      reasons.push(`Reported dates within 2 weeks`);
    }
  }

  return {
    score: Math.min(score, 100),
    reasons,
  };
}

/**
 * Finds potential opposite-type matches for a newly created or updated item
 * and dispatches in-app notifications if score threshold is reached.
 */
async function findAndNotifyMatches(newItem) {
  try {
    const oppositeType = newItem.reportType === 'lost' ? 'found' : 'lost';

    // Find recent open opposite-type reports (within last 45 days)
    const windowDate = new Date();
    windowDate.setDate(windowDate.getDate() - 45);

    const candidates = await Item.find({
      reportType: oppositeType,
      status: 'open',
      moderationStatus: 'approved',
      _id: { $ne: newItem._id },
      createdAt: { $gte: windowDate },
    }).populate('owner', 'name email');

    const matches = [];

    for (const candidate of candidates) {
      const { score, reasons } = calculateSimilarity(newItem, candidate);

      // Score threshold for high-confidence alert
      if (score >= 45) {
        matches.push({
          item: candidate,
          score,
          reasons,
        });

        // Notify the owner of the candidate item
        if (candidate.owner && String(candidate.owner._id) !== String(newItem.owner)) {
          const typeLabel = newItem.reportType === 'lost' ? 'a lost item report' : 'a found item report';
          await Notification.create({
            recipient: candidate.owner._id,
            type: 'potential_match',
            message: `Smart Match (${score}% confidence): ${typeLabel} matching "${candidate.title}" was just reported at ${newItem.approximateLocation}.`,
            relatedItem: newItem._id,
          });
        }
      }
    }

    // Sort descending by score
    matches.sort((a, b) => b.score - a.score);

    // If matches found, notify the creator of newItem as well
    if (matches.length > 0) {
      const topMatch = matches[0];
      await Notification.create({
        recipient: newItem.owner,
        type: 'potential_match',
        message: `We found ${matches.length} potential matching report(s) for "${newItem.title}"! Top match: "${topMatch.item.title}" (${topMatch.score}% confidence).`,
        relatedItem: topMatch.item._id,
      });
    }

    return matches;
  } catch (error) {
    console.error('[SmartMatching] Error computing matches:', error.message);
    return [];
  }
}

module.exports = {
  calculateSimilarity,
  findAndNotifyMatches,
};
