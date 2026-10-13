import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Tag,
  Shield,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flag,
  Trash2,
  Edit3,
  Share2,
  Lock,
  Sparkles,
  UserCheck,
  Building2,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  const [item, setItem] = useState(null);
  const [userClaim, setUserClaim] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);

  // Form states
  const [claimExplanation, setClaimExplanation] = useState('');
  const [secretIdentifiers, setSecretIdentifiers] = useState('');
  const [receiptDetails, setReceiptDetails] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const [flagReason, setFlagReason] = useState('spam_or_fake');
  const [flagDesc, setFlagDesc] = useState('');
  const [submittingFlag, setSubmittingFlag] = useState(false);

  const fetchItem = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/items/${id}`);
      if (res.data.success) {
        setItem(res.data.item);
        setUserClaim(res.data.userClaim);
        setPotentialMatches(res.data.potentialMatches || []);
        setIsOwner(res.data.isOwner);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load item report');
      navigate('/items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to submit an ownership claim.');
      navigate(`/login?redirect=/items/${id}`);
      return;
    }

    try {
      setSubmittingClaim(true);
      const res = await api.post('/claims', {
        itemId: item._id,
        explanation: claimExplanation,
        secretIdentifiers,
        purchaseOrReceiptDetails: receiptDetails,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setClaimModalOpen(false);
        fetchItem();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFlag(true);
      const res = await api.post(`/items/${id}/flag`, {
        itemId: item._id,
        reason: flagReason,
        description: flagDesc,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setFlagModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to flag item.');
    } finally {
      setSubmittingFlag(false);
    }
  };

  const handleDeleteItem = async () => {
    try {
      const res = await api.delete(`/items/${id}`);
      if (res.data.success) {
        toast.success('Item report deleted successfully.');
        navigate('/items');
      }
    } catch (err) {
      toast.error('Failed to delete report.');
    }
  };

  const handleMarkRecovered = async () => {
    try {
      const res = await api.patch(`/items/${id}/recovered`);
      if (res.data.success) {
        toast.success('Item marked as recovered!');
        setRecoverModalOpen(false);
        fetchItem();
      }
    } catch (err) {
      toast.error('Could not update recovery status.');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `CampusConnect: ${item.title}`,
        text: `Lost & Found Report: ${item.title} on campus.`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.info('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Loading item details...</div>
      </div>
    );
  }

  if (!item) return null;

  const custodyLabels = {
    held_by_finder: 'Held securely by student finder',
    campus_office: 'Deposited at Campus Lost & Found Desk (Admin Block 104)',
    not_applicable: 'Not Applicable',
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem 1.25rem' }}>
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/items"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to all items</span>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2.5rem' }} className="details-layout">
        {/* Left Column: Images & Primary Details */}
        <div>
          {/* Main Photo Gallery */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              marginBottom: '1.5rem',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            {item.images && item.images.length > 0 ? (
              <img
                src={item.images[0]}
                alt={item.title}
                style={{
                  width: '100%',
                  maxHeight: '440px',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  height: '320px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  gap: '0.75rem',
                }}
              >
                <Tag size={48} opacity={0.4} />
                <span style={{ fontSize: '0.9375rem' }}>No photo was uploaded with this report</span>
              </div>
            )}
          </div>

          {/* Detailed Description */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              Item Description
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
              {item.description}
            </p>

            {/* Identifying characteristics for lost items */}
            {item.identifyingCharacteristics && (
              <div
                style={{
                  marginTop: '1.25rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--accent)',
                }}
              >
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  Distinguishing Features noted by reporter:
                </h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {item.identifyingCharacteristics}
                </p>
              </div>
            )}
          </div>

          {/* Potential Matches for Owner/Admin */}
          {(isOwner || isAdmin) && potentialMatches.length > 0 && (
            <div className="card" style={{ border: '1px solid var(--accent)', backgroundColor: 'var(--accent-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <Sparkles size={20} color="var(--accent)" />
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Smart Match Suggestions ({potentialMatches.length})
                </h3>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Our algorithm detected matching reports based on category, location, and dates.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {potentialMatches.map((m) => (
                  <div
                    key={m.item._id}
                    className="card"
                    style={{
                      padding: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: 'var(--bg-card)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{m.item.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {m.reasons.join(' • ')}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className="badge badge-recovered" style={{ fontSize: '0.7rem' }}>
                        {m.score}% Match
                      </span>
                      <Link to={`/items/${m.item._id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Metadata, Actions, and Verification */}
        <div>
          <div className="card" style={{ padding: '1.75rem' }}>
            {/* Badges */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <StatusBadge status={item.reportType} type="reportType" />
              <StatusBadge status={item.status} />
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>
              {item.title}
            </h1>

            {/* Key Metadata Table */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Tag size={16} color="var(--accent)" />
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.category}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{item.approximateLocation}</strong>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={16} color="var(--text-muted)" />
                <span style={{ color: 'var(--text-muted)' }}>Date Reported:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {new Date(item.eventDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </strong>
              </div>

              {item.reportType === 'found' && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <Building2 size={16} color="var(--info)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Custody Status: </span>
                    <strong style={{ color: 'var(--text-primary)' }}>
                      {custodyLabels[item.custodyStatus] || item.custodyStatus}
                    </strong>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserCheck size={16} color="var(--success)" />
                <span style={{ color: 'var(--text-muted)' }}>Reported By:</span>
                <strong style={{ color: 'var(--text-primary)' }}>
                  {item.owner ? item.owner.name : 'Campus Member'} ({item.owner?.department || 'Student'})
                </strong>
              </div>
            </div>

            {/* Current User Active Claim Status Banner */}
            {userClaim && (
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  marginBottom: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem', color: 'var(--warning)' }}>
                  <Lock size={16} />
                  <span>You have an active claim on this item</span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Status: <strong>{userClaim.status.toUpperCase()}</strong>. Submitted on{' '}
                  {new Date(userClaim.createdAt).toLocaleDateString()}.
                </p>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Claim Button for Found Items */}
              {item.reportType === 'found' && item.status !== 'recovered' && !isOwner && !userClaim && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <Shield size={18} />
                  <span>Claim This Item (Prove Ownership)</span>
                </button>
              )}

              {/* Mark Recovered for Owner/Admin */}
              {(isOwner || isAdmin) && item.status !== 'recovered' && (
                <button
                  onClick={() => setRecoverModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: 'var(--success)', color: 'var(--success)' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Mark as Successfully Recovered</span>
                </button>
              )}

              {/* Share Button */}
              <button onClick={handleShare} className="btn btn-secondary" style={{ width: '100%' }}>
                <Share2 size={16} />
                <span>Share Report Link</span>
              </button>

              {/* Owner/Admin Delete */}
              {(isOwner || isAdmin) && (
                <button
                  onClick={() => setDeleteModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                >
                  <Trash2 size={16} />
                  <span>Delete Report</span>
                </button>
              )}

              {/* Report/Flag Item */}
              {!isOwner && (
                <button
                  onClick={() => setFlagModalOpen(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem',
                  }}
                >
                  <Flag size={14} />
                  <span>Report inappropriate or spam content</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal */}
      {claimModalOpen && (
        <div className="modal-overlay" onClick={() => setClaimModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Submit Ownership Claim
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              To ensure safety and prevent fraudulent collections, please describe identifying details that only the true owner would know. Private details will be strictly visible only to campus review staff.
            </p>

            <form onSubmit={handleClaimSubmit}>
              <div className="form-group">
                <label className="form-label">Explanation of Ownership *</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  required
                  placeholder="Explain when and where you lost it, brand, color, contents..."
                  value={claimExplanation}
                  onChange={(e) => setClaimExplanation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confidential Identifying Marks / Passcodes</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="e.g. Phone wallpaper description, lock code length, stickers, scratches, internal engraving..."
                  value={secretIdentifiers}
                  onChange={(e) => setSecretIdentifiers(e.target.value)}
                />
                <span className="form-hint">These details are never published publicly.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Receipt or Serial Number (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Order ID, serial digits, or purchase shop..."
                  value={receiptDetails}
                  onChange={(e) => setReceiptDetails(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim || claimExplanation.length < 15}
                  className="btn btn-primary btn-sm"
                >
                  {submittingClaim ? 'Submitting...' : 'Submit Claim'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag / Report Modal */}
      {flagModalOpen && (
        <div className="modal-overlay" onClick={() => setFlagModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Report Inappropriate Content
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Flag this item report for campus administration moderation review.
            </p>

            <form onSubmit={handleFlagSubmit}>
              <div className="form-group">
                <label className="form-label">Reason</label>
                <select
                  className="form-select"
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                >
                  <option value="spam_or_fake">Spam or Fake Report</option>
                  <option value="inappropriate_content">Inappropriate Content / Language</option>
                  <option value="duplicate_post">Duplicate Post</option>
                  <option value="privacy_violation">Disclosing Private Student Data</option>
                  <option value="other">Other Violation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Additional Context (Optional)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={flagDesc}
                  onChange={(e) => setFlagDesc(e.target.value)}
                  placeholder="Briefly describe the issue..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setFlagModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submittingFlag} className="btn btn-danger btn-sm">
                  {submittingFlag ? 'Submitting...' : 'Flag Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Item Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        isDanger={true}
        confirmText="Delete"
        onConfirm={handleDeleteItem}
        onClose={() => setDeleteModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={recoverModalOpen}
        title="Confirm Item Recovery"
        message="Mark this item as recovered? This signifies that the item was returned to its rightful owner."
        confirmText="Confirm Recovery"
        onConfirm={handleMarkRecovered}
        onClose={() => setRecoverModalOpen(false)}
      />

      <style>{`
        @media (max-width: 860px) {
          .details-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemDetailsPage;
