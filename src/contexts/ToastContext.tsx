import { createContext, useContext } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
  show: (message: string, type: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const show = (message: string, type: ToastType) => {
    const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info;
    const bgColor = type === 'success' ? 'bg-green-50' : type === 'error' ? 'bg-red-50' : 'bg-blue-50';
    const textColor = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600';

    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full ${bgColor} shadow-lg rounded-lg pointer-events-auto flex items-center gap-3 p-4`}
      >
        <Icon className={`${textColor} h-5 w-5 flex-shrink-0`} />
        <p className={`${textColor} text-sm font-medium flex-1`}>{message}</p>
        <button
          onClick={() => toast.dismiss(t.id)}
          className={`${textColor} hover:opacity-70`}
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    ));
  };

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <Toaster position="top-right" />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}