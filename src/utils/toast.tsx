import toast from 'react-hot-toast';
import { Check, AlertCircle, Info } from 'lucide-react';
import React from 'react';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: React.createElement(Check, { 
        className: "h-5 w-5 text-green-500" 
      }),
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      icon: React.createElement(AlertCircle, { 
        className: "h-5 w-5 text-red-500" 
      }),
    });
  },
  
  info: (message: string) => {
    toast(message, {
      icon: React.createElement(Info, { 
        className: "h-5 w-5 text-blue-500" 
      }),
    });
  },
};