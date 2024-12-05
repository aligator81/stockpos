import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { notify } from '../utils/notify';
import { Transition } from '@headlessui/react';

export default function Notification() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = notify.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      {notifications.map(({ id, message, type }) => (
        <Transition
          key={id}
          show={true}
          enter="transition ease-out duration-300"
          enterFrom="transform opacity-0 translate-y-2"
          enterTo="transform opacity-100 translate-y-0"
          leave="transition ease-in duration-200"
          leaveFrom="transform opacity-100"
          leaveTo="transform opacity-0"
        >
          <div
            className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
              type === 'success'
                ? 'bg-green-50 text-green-800'
                : type === 'error'
                ? 'bg-red-50 text-red-800'
                : 'bg-blue-50 text-blue-800'
            }`}
          >
            {type === 'success' && <CheckCircle className="h-5 w-5" />}
            {type === 'error' && <AlertCircle className="h-5 w-5" />}
            {type === 'info' && <Info className="h-5 w-5" />}
            <p>{message}</p>
          </div>
        </Transition>
      ))}
    </div>
  );
}