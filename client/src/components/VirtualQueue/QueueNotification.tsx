import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Bell, X } from 'lucide-react';

export const QueueNotification: React.FC = () => {
  const { notification, clearNotification, setActiveTab } = useCafe();

  if (!notification) return null;

  const handleClick = () => {
    setActiveTab('queue');
    clearNotification();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-slide-up px-4 sm:px-0">
      <div className="bg-sumi-900 text-washi-50 border border-sumi-700 p-4 rounded-2xl shadow-zen-lg flex items-center justify-between gap-3">
        <div
          onClick={handleClick}
          className="flex items-center space-x-3 cursor-pointer flex-1"
        >
          <div className="w-9 h-9 rounded-xl bg-matcha-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-washi-50 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-serif font-bold text-washi-50">Notice • お呼出</div>
            <div className="text-xs text-washi-200 mt-0.5 leading-snug">{notification}</div>
          </div>
        </div>

        <button
          onClick={clearNotification}
          className="w-7 h-7 rounded-lg bg-sumi-800 hover:bg-sumi-700 text-washi-300 flex items-center justify-center transition shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
