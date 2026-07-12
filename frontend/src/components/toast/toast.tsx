import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type: Toast['type'], duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'], duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }
  }, [dismissToast]);

  const success = useCallback((msg: string, dur?: number) => showToast(msg, 'success', dur), [showToast]);
  const error = useCallback((msg: string, dur?: number) => showToast(msg, 'error', dur), [showToast]);
  const warning = useCallback((msg: string, dur?: number) => showToast(msg, 'warning', dur), [showToast]);
  const info = useCallback((msg: string, dur?: number) => showToast(msg, 'info', dur), [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, dismissToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-start justify-between p-4 rounded-lg border shadow-lg bg-white transition-all duration-300 animate-slide-in-right ${
              toast.type === 'success' ? 'border-emerald-200 text-emerald-900 bg-emerald-50/50' :
              toast.type === 'error' ? 'border-rose-200 text-rose-900 bg-rose-50/50' :
              toast.type === 'warning' ? 'border-amber-200 text-amber-900 bg-amber-50/50' :
              'border-indigo-200 text-indigo-900 bg-indigo-50/50'
            }`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5">
                {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
                {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
                {toast.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-600" />}
              </div>
              <p className="text-sm font-medium leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
