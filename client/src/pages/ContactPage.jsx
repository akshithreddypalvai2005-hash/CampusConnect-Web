import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const ContactPage = () => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await api.post('/contact', {
        name,
        email,
        subject,
        message,
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setSubmitted(true);
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      }
    } catch (err) {
      toast.error(err.message || 'Could not submit message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3.5rem 1.25rem 5rem 1.25rem', maxWidth: '980px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Contact Lost & Found Help Desk
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Have questions, disputes, or physical item inquiries? Get in touch with our campus coordinators.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '2.5rem' }} className="contact-layout">
        {/* Contact Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Send Us an Inquiry
          </h2>

          {submitted ? (
            <div
              style={{
                padding: '2rem 1rem',
                textAlign: 'center',
                backgroundColor: 'var(--success-bg)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--success-border)',
              }}
            >
              <CheckCircle2 size={40} color="var(--success)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>
                Inquiry Logged Successfully
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
                Your message has been stored in our system and forwarded to the campus student affairs office.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn btn-secondary btn-sm">
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Priya Patel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email *</label>
                <input
                  type="email"
                  className="form-input"
                  required
                  placeholder="e.g. priya.patel@campusconnect.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Inquiry regarding Casio Calculator report"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  required
                  placeholder="Provide complete details..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
                <Send size={16} />
                <span>{submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Office Contact Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Physical Office Location
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9375rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <MapPin size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Student Affairs Section</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Administration Block, Ground Floor, Room 104
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <Clock size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Operating Hours</strong>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Monday – Friday: 9:00 AM – 5:00 PM <br />
                    Saturday: 9:00 AM – 1:00 PM (Closed on Sundays & Holidays)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Phone size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    +91 98765 43210 (Desk Ext: 241)
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <Mail size={20} color="var(--primary)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    lostandfound@campusconnect.edu.in
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: 'var(--accent-light)',
              border: '1px solid var(--accent)',
            }}
          >
            <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
              Handover Protocol Reminder:
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Always bring your physical college student identity card when collecting an approved item at Room 104 for positive identification.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .contact-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
