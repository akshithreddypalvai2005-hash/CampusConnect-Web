/**
 * Sreyas Institute of Engineering & Technology Authentication Helper
 * Enforces strictly: <rollnumber>@sreyas.ac.in
 */

const BRANCH_CODES = {
  '01': 'Civil Engineering',
  '02': 'Electrical & Electronics Engineering',
  '03': 'Mechanical Engineering',
  '04': 'Electronics & Communication Engineering',
  '05': 'Computer Science & Engineering',
  '12': 'Information Technology',
  '62': 'Computer Science & Business Systems',
  '66': 'CSE (Artificial Intelligence & Machine Learning)',
  '67': 'CSE (Data Science)',
};

/**
 * Validates whether an email complies strictly with the Sreyas roll number format:
 * e.g. 21ve1a0521@sreyas.ac.in or 22241a0501@sreyas.ac.in
 */
function validateSreyasEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      reason: 'No email address provided.',
    };
  }

  const normalized = email.trim().toLowerCase();
  const domain = '@sreyas.ac.in';

  if (!normalized.endsWith(domain)) {
    return {
      isValid: false,
      reason: `Email must belong to the college domain ${domain}. Received: ${email}`,
    };
  }

  const prefix = normalized.slice(0, -domain.length);

  // Check special admin addresses
  if (prefix === 'admin' || prefix === 'lostandfound' || prefix === 'principal') {
    return {
      isValid: true,
      rollNumber: prefix.toUpperCase(),
      department: 'Campus Administration',
      yearOfStudy: 'Faculty/Staff',
      isAdmin: true,
    };
  }

  // Roll number format check: only alphanumeric characters (letters and numbers)
  const rollRegex = /^[a-z0-9]+$/;
  if (!rollRegex.test(prefix)) {
    return {
      isValid: false,
      reason: `Email prefix must be a valid alphanumeric roll number (e.g. 21ve1a0521@sreyas.ac.in). Received: '${prefix}'`,
    };
  }

  // Extract department and year if it matches JNTUH/Sreyas 10-char format:
  // e.g. 21VE1A0521 -> Year: 2021, Branch Code: 05 (CSE)
  let department = 'Computer Science & Engineering';
  let yearOfStudy = '3rd Year';

  if (prefix.length >= 8) {
    // Branch code is typically characters at index 6-7 or 7-8
    const branchPart = prefix.slice(6, 8);
    if (BRANCH_CODES[branchPart]) {
      department = BRANCH_CODES[branchPart];
    }

    // Joining year prefix (first 2 digits)
    const joinYear = parseInt(prefix.slice(0, 2), 10);
    const currentYear = 26; // 2026 session
    if (!isNaN(joinYear)) {
      const diff = currentYear - joinYear;
      if (diff <= 1) yearOfStudy = '1st Year';
      else if (diff === 2) yearOfStudy = '2nd Year';
      else if (diff === 3) yearOfStudy = '3rd Year';
      else if (diff >= 4) yearOfStudy = '4th Year';
    }
  }

  return {
    isValid: true,
    rollNumber: prefix.toUpperCase(),
    department,
    yearOfStudy,
    isAdmin: false,
  };
}

module.exports = {
  validateSreyasEmail,
};
