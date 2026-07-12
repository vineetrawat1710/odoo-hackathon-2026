import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: Record<string, string> = {
    // Core statuses
    AVAILABLE: 'badge-success',
    ON_TRIP: 'badge-info',
    IN_SHOP: 'badge-warning',
    RETIRED: 'badge-neutral',
    SUSPENDED: 'badge-danger',
    OFF_DUTY: 'badge-neutral',

    // Trip statuses
    DRAFT: 'badge-neutral',
    DISPATCHED: 'badge-info',
    COMPLETED: 'badge-success',
    CANCELLED: 'badge-danger',
    
    // Maintenance statuses
    ACTIVE: 'badge-warning',
    CLOSED: 'badge-success',

    // Fallback
    DEFAULT: 'badge-neutral'
  };

  const badgeClass = styles[status] || styles['DEFAULT'];
  
  // Decide if we should show a pulsing dot
  const showDot = ['AVAILABLE', 'ON_TRIP', 'ACTIVE'].includes(status);
  
  // Format text (e.g., ON_TRIP -> On Trip)
  const displayText = status.replace('_', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

  return (
    <span className={`badge ${badgeClass}`}>
      {showDot && <span className={`badge-dot ${status === 'AVAILABLE' ? 'bg-emerald-500 active' : status === 'ON_TRIP' ? 'bg-indigo-500 active' : 'bg-amber-500'}`} />}
      {displayText}
    </span>
  );
};
