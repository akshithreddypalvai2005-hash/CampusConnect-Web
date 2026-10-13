import React from 'react';
import { AlertCircle, CheckCircle, Scale, ShieldAlert } from 'lucide-react';

const TermsPage = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem 1.25rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Terms of Service & Campus Conduct
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
        Rules and Responsibilities for CampusConnect Users
      </p>

      <div className="card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Scale size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>1. Eligible Membership</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            Use of CampusConnect is restricted to actively enrolled undergraduate/postgraduate students, researchers, faculty, and administrative staff belonging to the college campus. Accounts registered under fraudulent identity are subject to disciplinary referral.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--danger)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>2. Zero Tolerance for Fraudulent Claims</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            Filing false ownership claims on items you do not own constitutes an honor code violation and theft under campus code. Submissions containing forged receipts, deceptive serial descriptions, or repeated false claims will trigger immediate account suspension and notification of the Proctorial Board.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={18} color="var(--success)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>3. Custody & Handover Compliance</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            High-value items (such as laptops, cash wallets, jewellery, and mobile devices) should preferably be deposited at the official campus Lost & Found desk in Room 104. When meeting for a peer-to-peer handover, both parties must conduct the exchange in well-lit, public campus areas.
          </p>
        </section>
      </div>
    </div>
  );
};

export default TermsPage;
