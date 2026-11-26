import React, { createContext, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        dismissToast(id);
      }, 3600);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0 pointer-events-none"
      >
        {toasts.map((toast) => {
          const styles =
            toast.type === 'success'
              ? 'border-emerald-200 bg-white text-[#1F2937]'
              : toast.type === 'error'
              ? 'border-rose-200 bg-white text-[#1F2937]'
              : 'border-amber-200 bg-white text-[#1F2937]';

          const icon =
            toast.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#0F3D3E]" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            ) : (
              <Info className="h-5 w-5 shrink-0 text-[#D97706]" />
            );

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto animate-fade-in flex items-start gap-3 rounded-2xl border p-3.5 shadow-lg shadow-black/5 ${styles}`}
            >
              <div className="mt-0.5">{icon}</div>
              <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="rounded-lg p-1 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-[#1F2937]"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast harus digunakan di dalam ToastProvider');
  }
  return ctx;
}
