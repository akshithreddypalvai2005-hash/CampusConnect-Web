import React from 'react';

const StatusBadge = ({ status, type = 'status' }) => {
  if (type === 'reportType') {
    return (
      <span className={`badge ${status === 'lost' ? 'badge-lost' : 'badge-found'}`}>
        {status === 'lost' ? '● Lost' : '● Found'}
      </span>
    );
  }

  const getBadgeClass = (s) => {
    switch (s) {
      case 'open':
        return 'badge-open';
      case 'claimed':
      case 'under_review':
        return 'badge-claimed';
      case 'recovered':
      case 'approved':
        return 'badge-recovered';
      case 'rejected':
      case 'cancelled':
      case 'closed':
        return 'badge-lost';
      default:
        return 'badge-open';
    }
  };

  const formatText = (s) => {
    if (!s) return 'Open';
    return s.replace(/_/g, ' ');
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {formatText(status)}
    </span>
  );
};

export default StatusBadge;
