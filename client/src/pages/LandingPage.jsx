import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Laptop,
  CreditCard,
  Briefcase,
  BookOpen,
  Key,
  Watch,
  Coffee,
  HelpCircle as OtherIcon,
  RefreshCw,
  BellRing,
  Lock,
} from 'lucide-react';
import api from '../services/api';
import ItemCard from '../components/common/ItemCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const categoryIcons = {
  Electronics: Laptop,
  'ID & Cards': CreditCard,
  'Bags & Wallets': Briefcase,
  'Books & Stationery': BookOpen,
  Keys: Key,
  'Personal Accessories': Watch,
  'Bottles & Flasks': Coffee,
  Others: OtherIcon,
};

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState(null);
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, recentRes] = await Promise.all([
          api.get('/items/stats'),
          api.get('/items/recent'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (recentRes.data.success) {
          setRecentItems(recentRes.data.items);
        }
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/items');
    }
  };

  const faqs = [
    {
      q: 'How does ownership verification prevent false claims?',
      a: 'When you submit a claim for a found item, you are prompted to describe unique non-public identifiers (e.g. phone lock screen wallpaper, specific scratches, receipt serial numbers, or stickers). These private details are protected and only reviewed by authorized campus administrators and the item finder.',
    },
    {
      q: 'Who moderates reports and handles physical handovers?',
      a: 'Students can choose to hand found items directly to the official Campus Lost & Found Office (Admin Block, Room 104) or retain custody until ownership is approved by administration.',
    },
    {
      q: 'How does the Smart Matching algorithm work?',
      a: 'Whenever a report is filed, CampusConnect automatically calculates a multi-factor similarity score between lost and found entries based on category equality, campus location vicinity, keyword overlap, and event date proximity.',
    },
    {
      q: 'Is my student contact information displayed publicly?',
      a: 'No. To ensure student safety, phone numbers, roll numbers, and personal emails are never published on item cards. Communication and claim coordination are managed securely inside CampusConnect.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
          padding: '4.5rem 0 3.5rem 0',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="container" style={{ textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              padding: '0.4rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            <Sparkles size={16} />
            <span>Smart Campus Belongings Recovery</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.75rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              maxWidth: '860px',
              margin: '0 auto 1.25rem auto',
            }}
          >
            Lost Something on Campus? <br />
            <span style={{ color: 'var(--accent)' }}>Let's Find It Together.</span>
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 2.25rem auto',
              lineHeight: 1.6,
            }}
          >
            The centralized lost and found platform designed for college campuses. Report lost belongings, publish found items, verify ownership securely, and retrieve what matters.
          </p>

          {/* Quick Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              maxWidth: '640px',
              margin: '0 auto 2rem auto',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius-full)',
              padding: '0.35rem 0.5rem 0.35rem 1.25rem',
              boxShadow: 'var(--shadow-md)',
              transition: 'var(--transition)',
            }}
          >
            <Search size={20} color="var(--text-muted)" style={{ marginRight: '0.75rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search lost or found items (e.g. ID card, headphones, charger)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '0.9375rem',
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm" style={{ borderRadius: 'var(--radius-full)' }}>
              Search Items
            </button>
          </form>

          {/* Primary Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/report-lost" className="btn btn-primary btn-lg">
              <PlusCircle size={20} />
              <span>Report Lost Item</span>
            </Link>
            <Link to="/items" className="btn btn-secondary btn-lg">
              <Search size={20} />
              <span>Browse Found Items</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real Database Statistics */}
      <section style={{ padding: '2.5rem 0', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1.5rem',
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats ? stats.totalReports : '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Total Reports Filed</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--danger)' }}>
                {stats ? stats.totalLost : '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Active Lost Items</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--info)' }}>
                {stats ? stats.totalFound : '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Found Items Cataloged</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--success)' }}>
                {stats ? stats.totalRecovered : '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Successfully Recovered</div>
            </div>
            <div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                {stats ? `${stats.recoveryRate}%` : '—'}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>Recovery Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Reported Items */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Recently Reported Items
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Latest missing and discovered items logged across campus blocks.
              </p>
            </div>
            <Link to="/items" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View All Reports</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSkeleton count={3} />
          ) : recentItems.length > 0 ? (
            <div className="grid-cards">
              {recentItems.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No items reported yet. Be the first to file a report!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>How CampusConnect Works</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              A systematic 4-step workflow to guarantee authentic items reach their rightful owners safely.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '2rem',
            }}
          >
            {/* Step 1 */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--border)',
                  lineHeight: 1,
                }}
              >
                01
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <PlusCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Report an Item</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Submit a detailed report with category, approximate campus location, photos, and time lost or found.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--border)',
                  lineHeight: 1,
                }}
              >
                02
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--accent-light)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <RefreshCw size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Smart Match & Search</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Our deterministic engine calculates multi-factor similarity and triggers in-app match alerts to users.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--border)',
                  lineHeight: 1,
                }}
              >
                03
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--warning-bg)',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verify Ownership</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Submit confidential proof (lock codes, receipts, serials, unique marks) reviewed exclusively by administrators.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--border)',
                  lineHeight: 1,
                }}
              >
                04
              </div>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--success-bg)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <CheckCircle size={24} />
              </div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Safe Handover</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Collect your belonging at the campus lost & found desk or from the finder with recorded confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Categories Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Browse by Category</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Quickly filter reports by commonly misplaced campus items.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '1rem',
            }}
          >
            {Object.keys(categoryIcons).map((catName) => {
              const IconComp = categoryIcons[catName];
              return (
                <Link
                  key={catName}
                  to={`/items?category=${encodeURIComponent(catName)}`}
                  className="card"
                  style={{
                    padding: '1.5rem 0.75rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'var(--transition)',
                  }}
                >
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent)',
                    }}
                  >
                    <IconComp size={22} />
                  </div>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {catName}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
              color: '#ffffff',
              padding: '3rem 2rem',
              borderRadius: 'var(--radius-lg)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={16} />
                <span>Zero Tolerance for Fraud</span>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.2 }}>
                Built with Student Safety and Integrity at Heart
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Every report and ownership claim undergoes role-based validation, server audit logging, and moderation. Private ownership identifiers remain strictly concealed from the public.
              </p>
              <Link to="/about" className="btn btn-secondary btn-sm" style={{ color: '#0f172a' }}>
                Learn About Our Verification Model
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <Lock size={20} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>Confidential Evidence Vault</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Receipts, device lock codes, and private photos are kept strictly hidden from other students.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <BellRing size={20} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>Immediate Status Notifications</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Receive in-app updates the moment your claim is reviewed, approved, or matched.</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                  <ShieldCheck size={20} color="#ffffff" />
                </div>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.2rem' }}>Centralized Campus Custody</h4>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Valuable items can be directly deposited at the campus administration lost desk for safe-keeping.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Clear answers on how the college lost and found workflow operates.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: 'var(--text-primary)',
                    }}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                  {isOpen && (
                    <p
                      style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid var(--border)',
                      }}
                    >
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
