import React from 'react';
import { SearchX, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  title = 'No Items Found',
  description = 'We could not find any reports matching your search or filters.',
  actionText = 'Report an Item',
  actionLink = '/report-lost',
  secondaryActionText = 'Clear Filters',
  onSecondaryAction,
  icon: CustomIcon,
}) => {
  const IconComponent = CustomIcon || SearchX;

  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        padding: '3.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        borderStyle: 'dashed',
        backgroundColor: 'var(--bg-secondary)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <IconComponent size={32} />
      </div>

      <div style={{ maxWidth: '420px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.35rem' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
          {description}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {onSecondaryAction && (
          <button onClick={onSecondaryAction} className="btn btn-secondary btn-sm">
            {secondaryActionText}
          </button>
        )}
        {actionLink && (
          <Link to={actionLink} className="btn btn-primary btn-sm">
            {actionText}
          </Link>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
