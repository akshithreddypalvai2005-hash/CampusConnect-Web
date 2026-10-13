import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Cpu, Database, Users, CheckCircle } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem 1.25rem', maxWidth: '880px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #1e3a8a 0%, #4f46e5 100%)',
            color: '#ffffff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
          }}
        >
          <Compass size={32} />
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          About CampusConnect
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem' }}>
          Smart Lost & Found Management System for College Campuses
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Project Overview Card */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--primary)' }}>
            1. Problem Statement & Motivation
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
            College campuses are sprawling environments bustling with thousands of students, faculty, and visitors. Every day, critical belongings such as <strong>Identity cards, laptops, wireless earphones, scientific calculators, notebooks, and keys</strong> are misplaced in lecture halls, laboratories, cafeterias, and transit points.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Traditional solutions rely on fragmented WhatsApp groups, physical bulletin boards, or unverified social media posts. These informal methods suffer from zero verification, fraudulent claims, privacy disclosure, lack of search indexing, and no audit trail. <strong>CampusConnect solves this with a centralized, secure web platform.</strong>
          </p>
        </div>

        {/* System Architecture */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            2. Technology Stack & Architecture
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--accent)' }}>Frontend (React + Vite)</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Component-driven architecture using React 18, React Router v6, Lucide icons, responsive CSS variables with light/dark theme, and Recharts analytics.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--accent)' }}>Backend (Express + Node.js)</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                RESTful API endpoints, JWT authentication stored in HTTP-only cookies, bcryptjs password hashing, Helmet headers, rate limiting, and Zod input validation.
              </p>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--accent)' }}>Database (MongoDB + Mongoose)</h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Relational document models with compound text search indexing, confidential evidence storage, append-only security audit logs, and in-memory zero-setup fallback.
              </p>
            </div>
          </div>
        </div>

        {/* Core Innovations */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--primary)' }}>
            3. Key System Highlights
          </h2>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                <strong>Deterministic Smart Matching:</strong> Analyzes category equality, campus location vicinity, keyword overlap, and date proximity window to alert students automatically.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                <strong>Confidential Ownership Vault:</strong> Claimants provide secret identifiers (device wallpaper, receipts, serials) that remain strictly hidden from the public to prevent theft.
              </span>
            </li>
            <li style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                <strong>Comprehensive Administration & Audit Trail:</strong> Moderation workflows, user account management, and append-only activity tracking for college compliance.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
