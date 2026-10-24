import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  PlusCircle,
  Clock,
  Shield,
  Bookmark,
  Settings,
  CheckCircle2,
  Trash2,
  Edit,
  ExternalLink,
  Phone,
  Building,
  GraduationCap,
  Save,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EmptyState from '../components/common/EmptyState';

const UserDashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('lost');
  const [profileData, setProfileData] = useState(null);
  const [lostReports, setLostReports] = useState([]);
  const [foundReports, setFoundReports] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editYear, setEditYear] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        api.get('/users/me'),
        api.get('/users/my-reports?reportType=lost'),
        api.get('/users/my-reports?reportType=found'),
        api.get('/claims/my'),
        api.get('/users/saved-items'),
      ]);

      const [profileRes, lostRes, foundRes, claimsRes, savedRes] = results;

      if (profileRes.status === 'fulfilled' && profileRes.value.data?.success) {
        const data = profileRes.value.data;
        setProfileData(data);
        if (data.user) {
          setEditName(data.user.name || '');
          setEditPhone(data.user.phone || '');
          setEditDept(data.user.department || '');
          setEditYear(data.user.yearOfStudy || '1st Year');
        }
      }
      if (lostRes.status === 'fulfilled' && lostRes.value.data.success) {
        setLostReports(lostRes.value.data.items);
      }
      if (foundRes.status === 'fulfilled' && foundRes.value.data.success) {
        setFoundReports(foundRes.value.data.items);
      }
      if (claimsRes.status === 'fulfilled' && claimsRes.value.data.success) {
        setMyClaims(claimsRes.value.data.claims);
      }
      if (savedRes.status === 'fulfilled' && savedRes.value.data.success) {
        setSavedItems(savedRes.value.data.items);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.patch('/users/me', {
        name: editName,
        phone: editPhone,
        department: editDept,
        yearOfStudy: editYear,
      });

      if (res.data.success) {
        toast.success('Account profile updated successfully!');
        await refreshUser();
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Failed to update profile settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await api.delete(`/items/${deleteTargetId}`);
      if (res.data.success) {
        toast.success('Report deleted successfully');
        setDeleteTargetId(null);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error('Could not delete report.');
    }
  };

  const handleCancelClaim = async (claimId) => {
    try {
      const res = await api.patch(`/claims/${claimId}/cancel`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDashboardData();
      }
    } catch (err) {
      toast.error(err.message || 'Could not cancel claim.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontWeight: 600 }}>Loading student dashboard...</div>
      </div>
    );
  }

  const stats = profileData?.stats || {
    totalReports: 0,
    totalLostReports: 0,
    totalFoundReports: 0,
    pendingClaims: 0,
    approvedClaims: 0,
    recoveredCount: 0,
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem 1.25rem' }}>
      {/* Header Profile Summary */}
      <div
        className="card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-tertiary) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name || 'Student'}</h1>
              <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>
                {user?.studentId || 'STUDENT'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem', flexWrap: 'wrap' }}>
              <span>{user?.email || ''}</span>
              <span>•</span>
              <span>{user?.department || 'Student'}</span>
              <span>•</span>
              <span>{user?.yearOfStudy || 'Undergraduate'}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/report-lost" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            <span>Report Lost</span>
          </Link>
          <Link to="/report-found" className="btn btn-secondary btn-sm">
            <PlusCircle size={16} />
            <span>Report Found</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary)' }}>{stats.totalReports}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>My Total Reports</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--danger)' }}>{stats.totalLostReports}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lost Reports</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--info)' }}>{stats.totalFoundReports}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Found Reports</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--warning)' }}>{stats.pendingClaims}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Claims in Review</div>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>{stats.approvedClaims}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Approved Claims</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '1.75rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'lost', label: `My Lost Reports (${lostReports.length})` },
          { id: 'found', label: `My Found Reports (${foundReports.length})` },
          { id: 'claims', label: `My Ownership Claims (${myClaims.length})` },
          { id: 'saved', label: `Saved Items (${savedItems.length})` },
          { id: 'settings', label: 'Account Settings' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.9375rem',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent)' : 'transparent'}`,
              background: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'var(--transition)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {/* 1. My Lost Reports */}
      {activeTab === 'lost' && (
        <div>
          {lostReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {lostReports.map((item) => (
                <div key={item._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <StatusBadge status={item.status} />
                      <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>
                        {item.category}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Location: {item.approximateLocation} • Reported on {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
                      <ExternalLink size={14} />
                      <span>View</span>
                    </Link>
                    <button
                      onClick={() => setDeleteTargetId(item._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Lost Reports Submitted"
              description="You have not filed any lost item reports yet."
              actionText="Report Lost Item"
              actionLink="/report-lost"
            />
          )}
        </div>
      )}

      {/* 2. My Found Reports */}
      {activeTab === 'found' && (
        <div>
          {foundReports.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {foundReports.map((item) => (
                <div key={item._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.35rem' }}>
                      <StatusBadge status={item.status} />
                      <span className="badge badge-found" style={{ fontSize: '0.7rem' }}>
                        {item.custodyStatus === 'campus_office' ? 'At Campus Desk' : 'With Finder'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      Location: {item.approximateLocation} • Found on {new Date(item.eventDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
                      <ExternalLink size={14} />
                      <span>View Details</span>
                    </Link>
                    <button
                      onClick={() => setDeleteTargetId(item._id)}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Found Reports Submitted"
              description="You have not reported any found items yet."
              actionText="Report Found Item"
              actionLink="/report-found"
            />
          )}
        </div>
      )}

      {/* 3. My Claims */}
      {activeTab === 'claims' && (
        <div>
          {myClaims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myClaims.map((claim) => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <StatusBadge status={claim.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Submitted {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                        Claim on: {claim.item && typeof claim.item === 'object' ? claim.item.title : 'Item'}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {claim.item && typeof claim.item === 'object' && claim.item._id && (
                        <Link to={`/items/${claim.item._id}`} className="btn btn-secondary btn-sm">
                          <ExternalLink size={14} />
                          <span>View Item</span>
                        </Link>
                      )}
                      {['pending', 'under_review'].includes(claim.status) && (
                        <button
                          onClick={() => handleCancelClaim(claim._id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)' }}
                        >
                          Cancel Claim
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    <strong>My Explanation:</strong> {claim.explanation}
                  </p>

                  {claim.reviewNotes && (
                    <div
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8125rem',
                        borderLeft: '3px solid var(--accent)',
                      }}
                    >
                      <strong>Administrator Review Note:</strong> {claim.reviewNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Ownership Claims Filed"
              description="Browse found items across campus and submit an ownership claim if you spot your lost belonging."
              actionText="Browse Found Items"
              actionLink="/items?reportType=found"
            />
          )}
        </div>
      )}

      {/* 4. Saved Items */}
      {activeTab === 'saved' && (
        <div>
          {savedItems.filter(Boolean).length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {savedItems.filter(Boolean).map((item) => (
                <div key={item._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {item.category} • {item.approximateLocation}
                    </p>
                  </div>
                  <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Saved Items"
              description="You haven't bookmarked any item reports yet. Click the bookmark icon on any card to save it."
              actionText="Browse Items"
              actionLink="/items"
            />
          )}
        </div>
      )}

      {/* 5. Account Settings */}
      {activeTab === 'settings' && (
        <div className="card" style={{ maxWidth: '600px', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
            Account Profile Settings
          </h3>
          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="+91 XXXXX XXXXX"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                required
                value={editDept}
                onChange={(e) => setEditDept(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year of Study</label>
              <select
                className="form-select"
                value={editYear}
                onChange={(e) => setEditYear(e.target.value)}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
                <option value="Faculty/Staff">Faculty/Staff</option>
              </select>
            </div>

            <button type="submit" disabled={savingSettings} className="btn btn-primary" style={{ marginTop: '1rem' }}>
              <Save size={16} />
              <span>{savingSettings ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Item Report"
        message="Are you sure you want to delete this report? This action is permanent."
        isDanger={true}
        confirmText="Delete"
        onConfirm={handleDeleteReport}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
};

export default UserDashboardPage;
