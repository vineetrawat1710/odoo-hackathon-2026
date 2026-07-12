import React from 'react';
import { AlertCircle, AlertOctagon, ShieldAlert, FolderOpen, RefreshCw } from 'lucide-react';
import { Button } from '../button/button';

// 1. Loading Skeleton Loader
export const SkeletonLoader: React.FC<{ type?: 'card' | 'table' | 'kpi' | 'list' }> = ({ type = 'card' }) => {
  if (type === 'kpi') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-2"></div>
            <div className="h-8 w-3/4 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 w-full space-y-4 animate-pulse">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded"></div>
          <div className="h-8 w-24 bg-slate-200 rounded"></div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="h-4 flex-1 bg-slate-200 rounded"></div>
            <div className="h-4 flex-1 bg-slate-200 rounded"></div>
            <div className="h-4 flex-1 bg-slate-200 rounded"></div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 w-full space-y-3 animate-pulse">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
              <div className="h-3 w-1/2 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 w-full space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-slate-200 rounded"></div>
      <div className="h-32 bg-slate-200 rounded-lg"></div>
      <div className="flex justify-end space-x-2">
        <div className="h-8 w-20 bg-slate-200 rounded"></div>
        <div className="h-8 w-20 bg-slate-200 rounded"></div>
      </div>
    </div>
  );
};

// 2. Error State Screen
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'An unexpected error occurred while processing dashboard telemetry data.',
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-xl max-w-lg mx-auto my-8">
      <div className="p-3 bg-rose-50 rounded-full text-rose-600 mb-4">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">System Telemetry Error</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-6"
          onClick={onRetry}
          leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
};

// 3. Empty State Template
interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Your current search or filter query returned no matching logistics results.',
  actionText,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
      <div className="p-3 bg-slate-100 rounded-full text-slate-400 mb-4">
        <FolderOpen className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1.5 max-w-xs">{description}</p>
      {actionText && onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

// 4. Unauthorized State
export const UnauthorizedState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white border border-slate-200 rounded-xl max-w-md mx-auto my-12">
      <div className="p-3 bg-amber-50 rounded-full text-amber-600 mb-4">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">Session Expired</h3>
      <p className="text-sm text-slate-500 mt-2">
        Your security token has expired or is invalid. Please sign in again to access the fleet control systems.
      </p>
      <Button 
        className="mt-6" 
        onClick={() => window.location.href = '/login'}
      >
        Sign In to Portal
      </Button>
    </div>
  );
};

// 5. Forbidden State
export const ForbiddenState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-white border border-slate-200 rounded-xl max-w-md mx-auto my-12">
      <div className="p-3 bg-rose-50 rounded-full text-rose-600 mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">Access Denied</h3>
      <p className="text-sm text-slate-500 mt-2">
        You do not have the required role permissions (Admin/Dispatcher) to access this system setting or modify fleet properties.
      </p>
      <Button 
        variant="outline"
        className="mt-6" 
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </div>
  );
};
