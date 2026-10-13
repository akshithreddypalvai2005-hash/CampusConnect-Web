import React from 'react';
import { ShieldCheck, Lock, EyeOff, Server } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem 1.25rem', maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Privacy Policy & Data Protection
      </h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
        Effective Date: Academic Session 2025–2026 • CampusConnect Platform
      </p>

      <div className="card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Lock size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>1. Data Collection & Student Confidentiality</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            CampusConnect collects your name, college email address, student roll number, academic department, and year of study during registration solely for verification purposes within the institution. We do not sell, rent, or share personal student information with commercial third parties.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <EyeOff size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>2. Public vs. Private Item Details</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            To prevent opportunistic and fraudulent claims, public item listings only display general titles, locations, and category data. Sensitive ownership evidence (such as lock screen codes, receipts, device serial numbers, or confidential marks) are stored securely and are only viewable by authorized campus administrators and the item finder.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Server size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>3. Authentication & Cookies</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            We utilize secure, HTTP-only JSON Web Token (JWT) cookies for stateful session persistence. Passwords are never stored in plain text and are hashed using one-way bcrypt with cryptographic salts.
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <ShieldCheck size={18} color="var(--accent)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>4. Audit Trail & Incident Logs</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9375rem' }}>
            All moderation actions, claim reviews, and account updates are recorded in an append-only audit trail. IP addresses and user agents are logged during state changes to protect against harassment or fraudulent claims.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;
