import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  Lock,
  Eye,
  RefreshCw,
  Activity,
  UserX,
  UserCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import StatusBadge from '../components/common/StatusBadge';
import ConfirmationModal from '../components/common/ConfirmationModal';
import EmptyState from '../components/common/EmptyState';

const AdminDashboardPage = () => {
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  // Claims tab state
  const [claims, setClaims] = useState([]);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimReviewModalOpen, setClaimReviewModalOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState('approved');
  const [reviewNotes, setReviewNotes] = useState('');
  const [confirmHandover, setConfirmHandover] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);

  // Items tab state
  const [adminItems, setAdminItems] = useState([]);
  const [itemSearch, setItemSearch] = useState('');

  // Users tab state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Flags tab state
  const [flags, setFlags] = useState([]);

  // Audit logs tab state
  const [auditLogs, setAuditLogs] = useState([]);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentActivity(res.data.recentActivity || []);
      }
    } catch (err) {
      toast.error('Failed to load admin statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    try {
      const res = await api.get('/admin/claims');
      if (res.data.success) setClaims(res.data.claims);
    } catch (err) {
      toast.error('Could not fetch claims.');
    }
  };

  const fetchAdminItems = async () => {
    try {
      const res = await api.get(`/admin/items?search=${encodeURIComponent(itemSearch)}`);
      if (res.data.success) setAdminItems(res.data.items);
    } catch (err) {
      toast.error('Could not fetch item reports.');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`);
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      toast.error('Could not fetch user directory.');
    }
  };

  const fetchFlags = async () => {
    try {
      const res = await api.get('/admin/flags');
      if (res.data.success) setFlags(res.data.flags);
    } catch (err) {
      toast.error('Could not fetch flags.');
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) setAuditLogs(res.data.logs);
    } catch (err) {
      toast.error('Could not fetch audit logs.');
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'claims') fetchClaims();
    if (activeTab === 'items') fetchAdminItems();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'flags') fetchFlags();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab]);

  const handleReviewClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      setSubmittingReview(true);
      const res = await api.patch(`/admin/claims/${selectedClaim._id}/review`, {
        status: reviewStatus,
        reviewNotes,
        confirmHandover,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setClaimReviewModalOpen(false);
        fetchClaims();
        fetchAdminStats();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to review claim.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Could not update user status.');
    }
  };

  const handleUpdateItemModeration = async (itemId, newModStatus) => {
    try {
      const res = await api.patch(`/admin/items/${itemId}/moderation`, {
        moderationStatus: newModStatus,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAdminItems();
      }
    } catch (err) {
      toast.error('Could not update moderation status.');
    }
  };

  const handleResolveFlag = async (flagId, newStatus) => {
    try {
      const res = await api.patch(`/admin/flags/${flagId}`, { status: newStatus });
      if (res.data.success) {
        toast.success('Flag resolved.');
        fetchFlags();
      }
    } catch (err) {
      toast.error('Could not resolve flag.');
    }
  };

  // Recharts Colors
  const COLORS = ['#1e3a8a', '#4f46e5', '#059669', '#d97706', '#dc2626'];

  const pieData = stats
    ? [
        { name: 'Lost Items', value: stats.totalLost },
        { name: 'Found Items', value: stats.totalFound },
        { name: 'Recovered', value: stats.totalRecovered },
      ]
    : [];

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 5rem 1.25rem' }}>
      {/* Top Banner */}
      <div
        className="card"
        style={{
          padding: '1.75rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Shield size={28} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                CampusConnect Administration Console
              </h1>
              <span className="badge badge-recovered" style={{ fontSize: '0.7rem' }}>
                Admin Active
              </span>
            </div>
            <p style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
              Full moderation, ownership claim verification, user accounts, and security audit trail.
            </p>
          </div>
        </div>

        <button onClick={fetchAdminStats} className="btn btn-secondary btn-sm" style={{ color: '#0f172a' }}>
          <RefreshCw size={14} />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* Admin Nav Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border)',
          marginBottom: '2rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'overview', label: 'Overview & Analytics' },
          { id: 'claims', label: `Claims Review Queue (${stats?.pendingClaims || 0})` },
          { id: 'items', label: 'Item Reports' },
          { id: 'users', label: 'User Directory' },
          { id: 'flags', label: `Reported Flags (${stats?.pendingFlags || 0})` },
          { id: 'audit', label: 'Security Audit Logs' },
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

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div>
          {/* Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.25rem',
              marginBottom: '2.5rem',
            }}
          >
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats?.totalReports || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Reports</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--danger)' }}>
                {stats?.totalLost || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Lost Items</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--info)' }}>
                {stats?.totalFound || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Found Items</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--warning)' }}>
                {stats?.pendingClaims || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Claims Pending Review</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--success)' }}>
                {stats?.totalRecovered || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Recovered & Handed Over</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>
                {stats?.totalUsers || 0}
              </div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Registered Users</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="charts-row">
            {/* Pie Distribution */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
                Item Status Breakdown
              </h3>
              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Activity Feed */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>
                Recent Platform Audit Events
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '260px', overflowY: 'auto' }}>
                {recentActivity.map((log) => (
                  <div
                    key={log._id}
                    style={{
                      padding: '0.625rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-tertiary)',
                      fontSize: '0.8125rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <strong style={{ color: 'var(--accent)' }}>{log.action}</strong>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Actor: {log.actor?.name || 'System / Guest'} • Target: {log.targetType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLAIMS REVIEW QUEUE */}
      {activeTab === 'claims' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
              Ownership Claim Review Queue
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Inspect confidential ownership evidence and decide verification status.
            </p>
          </div>

          {claims.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {claims.map((claim) => (
                <div key={claim._id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.35rem' }}>
                        <StatusBadge status={claim.status} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Submitted {new Date(claim.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.1875rem', fontWeight: 800 }}>
                        Claim on: {claim.item ? claim.item.title : 'Deleted Item'}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Claimant: <strong>{claim.claimant?.name}</strong> ({claim.claimant?.studentId}) • {claim.claimant?.department} • {claim.claimant?.email}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {claim.item && (
                        <Link to={`/items/${claim.item._id}`} className="btn btn-secondary btn-sm">
                          <ExternalLink size={14} />
                          <span>View Item</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setSelectedClaim(claim);
                          setReviewStatus(claim.status === 'pending' ? 'approved' : claim.status);
                          setReviewNotes(claim.reviewNotes || '');
                          setConfirmHandover(true);
                          setClaimReviewModalOpen(true);
                        }}
                        className="btn btn-primary btn-sm"
                      >
                        <Shield size={14} />
                        <span>Review Claim</span>
                      </button>
                    </div>
                  </div>

                  {/* Public explanation */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                      STUDENT EXPLANATION:
                    </div>
                    <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      {claim.explanation}
                    </p>
                  </div>

                  {/* Private Evidence Box */}
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--accent)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.35rem' }}>
                      <Lock size={14} />
                      <span>Confidential Ownership Evidence (Administrator View)</span>
                    </div>
                    <div style={{ marginBottom: '0.35rem' }}>
                      <strong>Secret Identifiers / Passcodes:</strong> {claim.privateEvidence?.secretIdentifiers || 'None specified'}
                    </div>
                    <div>
                      <strong>Receipt / Order Details:</strong> {claim.privateEvidence?.purchaseOrReceiptDetails || 'None provided'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Claims in Review"
              description="There are currently no active ownership claims pending administrative verification."
            />
          )}
        </div>
      )}

      {/* TAB 3: ITEM REPORTS MODERATION */}
      {activeTab === 'items' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Item Moderation & Reports</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Inspect and manage all campus lost and found listings.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchAdminItems();
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="form-input"
                style={{ width: '260px' }}
                placeholder="Search reports..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Search
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {adminItems.map((item) => (
              <div
                key={item._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <StatusBadge status={item.reportType} type="reportType" />
                    <StatusBadge status={item.status} />
                    <span className="badge badge-open" style={{ fontSize: '0.7rem' }}>
                      Mod: {item.moderationStatus}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{item.title}</h3>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Reporter: {item.owner?.name} ({item.owner?.studentId}) • {item.approximateLocation} • Category: {item.category}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link to={`/items/${item._id}`} className="btn btn-secondary btn-sm">
                    View
                  </Link>

                  {item.moderationStatus !== 'approved' && (
                    <button
                      onClick={() => handleUpdateItemModeration(item._id, 'approved')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--success)' }}
                    >
                      Approve
                    </button>
                  )}

                  {item.moderationStatus !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateItemModeration(item._id, 'rejected')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Student & User Directory</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Manage campus student accounts and suspend suspicious actors.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchUsers();
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                className="form-input"
                style={{ width: '260px' }}
                placeholder="Search by name, ID, or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm">
                Search
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {users.map((u) => (
              <div
                key={u._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700 }}>{u.name}</h3>
                    <span className={`badge ${u.role === 'admin' ? 'badge-claimed' : 'badge-open'}`} style={{ fontSize: '0.7rem' }}>
                      {u.role.toUpperCase()}
                    </span>
                    <span className={`badge ${u.accountStatus === 'active' ? 'badge-recovered' : 'badge-lost'}`} style={{ fontSize: '0.7rem' }}>
                      {u.accountStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    Student ID: {u.studentId} • {u.email} • {u.department} ({u.yearOfStudy})
                  </div>
                </div>

                <div>
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => handleToggleUserStatus(u._id, u.accountStatus)}
                      className={`btn btn-sm ${u.accountStatus === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ color: u.accountStatus === 'active' ? 'var(--danger)' : '#fff' }}
                    >
                      {u.accountStatus === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: REPORTED FLAGS */}
      {activeTab === 'flags' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reported Content & Flags</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Complaints and spam reports submitted by campus members.
            </p>
          </div>

          {flags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {flags.map((flag) => (
                <div key={flag._id} className="card" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span className="badge badge-lost" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>
                        Reason: {flag.reason.replace(/_/g, ' ')}
                      </span>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                        Target: {flag.targetItem?.title || 'Unknown Item'}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {flag.description || 'No additional note provided.'}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Reported by: {flag.reporter?.name} • Status: {flag.status}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {flag.targetItem && (
                        <Link to={`/items/${flag.targetItem._id}`} className="btn btn-secondary btn-sm">
                          Inspect Item
                        </Link>
                      )}
                      {flag.status === 'pending' && (
                        <button
                          onClick={() => handleResolveFlag(flag._id, 'resolved')}
                          className="btn btn-primary btn-sm"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No Flagged Reports"
              description="No user complaints or spam reports are currently pending review."
            />
          )}
        </div>
      )}

      {/* TAB 6: SECURITY AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Chronological Security Audit Trail</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Append-only tamper-evident log of administrative and user actions across the platform.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {auditLogs.map((log) => (
              <div
                key={log._id}
                className="card"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  fontFamily: 'monospace',
                  fontSize: '0.8125rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                    <strong style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>{log.action}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>[{log.targetType}]</span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Actor: {log.actor?.name || 'System / Anonymous'} ({log.actor?.email || 'N/A'})
                  </div>
                </div>

                <div style={{ color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div>{new Date(log.createdAt).toLocaleString()}</div>
                  <div style={{ fontSize: '0.75rem' }}>IP: {log.ipAddress || '127.0.0.1'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Review Decision Modal */}
      {claimReviewModalOpen && selectedClaim && (
        <div className="modal-overlay" onClick={() => setClaimReviewModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Review Ownership Claim
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Item: <strong>{selectedClaim.item?.title}</strong> | Claimant: <strong>{selectedClaim.claimant?.name}</strong>
            </p>

            <form onSubmit={handleReviewClaimSubmit}>
              <div className="form-group">
                <label className="form-label">Review Decision *</label>
                <select
                  className="form-select"
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value)}
                >
                  <option value="approved">Approve Claim (Ownership Verified)</option>
                  <option value="under_review">Mark Under Active Review</option>
                  <option value="rejected">Reject Claim (Insufficient Proof)</option>
                </select>
              </div>

              {reviewStatus === 'approved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <input
                    type="checkbox"
                    id="confirmHandoverCheck"
                    checked={confirmHandover}
                    onChange={(e) => setConfirmHandover(e.target.checked)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="confirmHandoverCheck" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>
                    Confirm physical handover completed (marks item as Recovered)
                  </label>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reviewer Notes (Sent to Student)</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Serial verified against student ID card or physical verification at Room 104..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setClaimReviewModalOpen(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn btn-primary btn-sm">
                  {submittingReview ? 'Saving Decision...' : 'Confirm Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 860px) {
          .charts-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;
