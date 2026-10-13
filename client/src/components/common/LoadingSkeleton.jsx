import React from 'react';

const LoadingSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid-cards">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="card"
          style={{
            padding: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <div className="skeleton" style={{ height: '180px', width: '100%' }} />
          <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="skeleton" style={{ height: '16px', width: '40%' }} />
            <div className="skeleton" style={{ height: '22px', width: '85%' }} />
            <div className="skeleton" style={{ height: '14px', width: '100%' }} />
            <div className="skeleton" style={{ height: '14px', width: '60%' }} />
            <div className="skeleton" style={{ height: '36px', width: '100%', marginTop: '0.5rem', borderRadius: 'var(--radius-md)' }} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
