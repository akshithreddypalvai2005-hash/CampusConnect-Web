import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, X, AlertCircle, ArrowLeft, PlusCircle } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { DEFAULT_CATEGORIES, DEFAULT_LOCATIONS } from '../constants/defaults';

const ReportLostPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [description, setDescription] = useState('');
  const [approximateLocation, setApproximateLocation] = useState(DEFAULT_LOCATIONS[0].name);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [identifyingCharacteristics, setIdentifyingCharacteristics] = useState('');
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
      toast.warning('Maximum 3 photos can be uploaded.');
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
      formData.append('reportType', 'lost');
      formData.append('approximateLocation', approximateLocation);
      formData.append('eventDate', eventDate);
      formData.append('identifyingCharacteristics', identifyingCharacteristics);

      images.forEach((img) => {
        formData.append('images', img);
      });

      const res = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        toast.success('Lost item report filed successfully!');
        navigate(`/items/${res.data.item._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit report.');
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
          <span className="badge badge-lost" style={{ marginBottom: '0.5rem' }}>
            ● Lost Item Form
          </span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', marginBottom: '0.35rem' }}>
            Report a Missing Item
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
            Provide accurate details to help campus peers identify and return your belonging.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Item Title */}
          <div className="form-group">
            <label className="form-label">Item Name / Title *</label>
            <input
              type="text"
              className="form-input"
              required
              placeholder="e.g. Black Sony WH-1000XM4 Headphones or Brown Leather Wallet"
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
                {categoriesList.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Lost */}
            <div className="form-group">
              <label className="form-label">Date Lost *</label>
              <input
                type="date"
                className="form-input"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">Approximate Campus Location *</label>
            <input
              type="text"
              className="form-input"
              required
              list="locations-datalist"
              placeholder="e.g. Central Library 2nd Floor or Cafeteria Table 10"
              value={approximateLocation}
              onChange={(e) => setApproximateLocation(e.target.value)}
            />
            <datalist id="locations-datalist">
              {locationsList.map((loc) => (
                <option key={loc._id} value={loc.name} />
              ))}
            </datalist>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              required
              placeholder="Describe color, size, brand, model, condition, contents, or circumstances of loss..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Identifying Characteristics */}
          <div className="form-group">
            <label className="form-label">Identifying Characteristics (Optional)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Small scratch near power button, unique keychain sticker, initials written..."
              value={identifyingCharacteristics}
              onChange={(e) => setIdentifyingCharacteristics(e.target.value)}
            />
            <span className="form-hint">
              Specific marks will be shown on the report to help finders verify that it matches yours.
            </span>
          </div>

          {/* Photo Upload with Previews */}
          <div className="form-group">
            <label className="form-label">Upload Photographs (Optional, Max 3)</label>
            <div
              style={{
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                textAlign: 'center',
                backgroundColor: 'var(--bg-secondary)',
                cursor: 'pointer',
              }}
              onClick={() => document.getElementById('lost-image-input').click()}
            >
              <UploadCloud size={32} color="var(--accent)" style={{ margin: '0 auto 0.5rem auto' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>Click to browse image files</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG, JPG or WebP (Max 5MB each)</div>
              <input
                id="lost-image-input"
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
              <PlusCircle size={20} />
              <span>{submitting ? 'Submitting Report...' : 'Publish Lost Item Report'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLostPage;
