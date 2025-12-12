import React from 'react';

interface StatusBadgeProps {
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected' | 'hired';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    new: {
      label: 'New',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    },
    reviewed: {
      label: 'Reviewed',
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    },
    shortlisted: {
      label: 'Shortlisted',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    },
    hired: {
      label: 'Hired',
      className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;