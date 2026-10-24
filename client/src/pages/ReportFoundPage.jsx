import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, ArrowLeft, CheckCircle, Building2, User } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from '../constants/defaults';

const ReportFoundPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [approximateLocation, setApproximateLocation] = useState(DEFAULT_LOCATIONS[0].name);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [custodyStatus, setCustodyStatus] = useState('held_by_finder');
  const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES);
  const [locationsList, setLocationsList] = useState(DEFAULT_LOCATIONS);

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, locRes] = await Promise.all([
          api.get('/categories'),
          api.get('/locations'),
        ]);
        if (catRes.data?.success && catRes.data.categories?.length > 0) {
          setCategoriesList(catRes.data.categories);
          setCategory((prev) => prev || catRes.data.categories[0].name);
        }
        if (locRes.data?.success && locRes.data.locations?.length > 0) {
          setLocationsList(locRes.data.locations);
          setApproximateLocation((prev) => prev || locRes.data.locations[0].name);
        }
      } catch (err) {
        console.error('Failed to load form metadata:', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 3) {
      toast.warning('Maximum 3 photos allowed.');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('reportType', 'found');
      formData.append('approximateLocation', approximateLocation);
      formData.append('eventDate', eventDate);
      formData.append('custodyStatus', custodyStatus);

      images.forEach((img) => {
        formData.append('images', img);
      });

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Found item report published successfully! Thank you for your honesty.');
        navigate(`/items/${res.data.item._id}`);
      }
    } catch (err) {
      const detailedMsg =
        err.errors && err.errors.length > 0
          ? err.errors.map((e) => e.message).join(', ')
          : err.message || 'Failed to submit report.';
      toast.error(detailedMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 5rem 1.25rem', maxWidth: '780px' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="card" style={{ padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span className="badge badge-found" style={{ marginBottom: '0.5rem' }}>
            ● Found Item Form
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.35rem' }}>
            Report a Found Belonging
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Thank you for being a responsible campus citizen! Report discovered belongings here.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Item Title *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Set of Keys with Marvel Keychain or Casio Calculator"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {(categoriesList && categoriesList.length > 0 ? categoriesList : DEFAULT_CATEGORIES).map((c) => (
                  <option key={c._id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Found */}
            <div className="form-group">
              <label className="form-label">Date Discovered *</label>
              <input
                type="date"
                className="form-input"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          {/* Location Found */}
          <div className="form-group">
            <label className="form-label">Where did you find it? *</label>
            <input
              type="text"
              className="form-input"
              required
              list="locations-found-datalist"
              placeholder="e.g. Main Cafeteria Table 14 or Sports Complex Court 2"
              value={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.value)}
            />
            <datalist id="locations-found-datalist">
              {(locationsList && locationsList.length > 0 ? locationsList : DEFAULT_LOCATIONS).map((loc) => (
                <option key={loc._id || loc.name} value={loc.name} />
              ))}
            </datalist>
          </div>

          {/* Custody Status Choice */}
          <div className="form-group">
            <label className="form-label">Current Custody of Item *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div
                onClick={() => setCustodyStatus('held_by_finder')}
                style={{
                  border: `2px solid ${custodyStatus === 'held_by_finder' ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: custodyStatus === 'held_by_finder' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'var(--transition)',
                }}
              >
                <User size={20} color={custodyStatus === 'held_by_finder' ? 'var(--accent)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Held by me (Finder)</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    I will hold the item until an admin approves the owner claim.
                  </div>
                </div>
              </div>

              <div
                onClick={() => setCustodyStatus('campus_office')}
                style={{
                  border: `2px solid ${custodyStatus === 'campus_office' ? 'var(--accent)' : 'var(--border)'}`,
                  backgroundColor: custodyStatus === 'campus_office' ? 'var(--accent-light)' : 'var(--bg-secondary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  transition: 'var(--transition)',
                }}
              >
                <Building2 size={20} color={custodyStatus === 'campus_office' ? 'var(--accent)' : 'var(--text-muted)'} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Handed to Campus Desk</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Deposited at Student Affairs Office (Admin Block 104).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">General Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Describe color, general brand, and where it was spotted. Avoid disclosing secret details (like lock screen photos or specific contents) so claimants must prove ownership!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className="form-hint">
              Security Tip: Do not disclose confidential contents publicly so claimants must prove ownership during verification.
            </span>
          </div>

          {/* Photo Upload */}
          <div className="form-group">
            <label className="form-label">Photographs (Optional)</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('found-image-input').click()}
            >
              <UploadCloud size={32} color="var(--accent)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to browse image files</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WebP (Max 5MB each)</div>
              <input
                id="found-image-input"
                type="file"
                multiple
                accept="image/png, image/jpeg, image/webp"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>

            {previews.length > 0 && (
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                {previews.map((prev, index) => (
                  <div key={index} style={{ position: 'relative', width: '90px', height: '90px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={prev} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button
              type="submit"
              disabled={submitting || !title || !description}
              className="btn btn-primary btn-lg"
              style={{ width: '100%' }}
            >
              <CheckCircle size={20} />
              <span>{submitting ? 'Submitting Report...' : 'Publish Found Item Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFoundPage;
