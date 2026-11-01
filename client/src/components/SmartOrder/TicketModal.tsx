import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { ShokenkiTicket } from './ShokenkiTicket';
import { X, CheckCircle, ArrowRight } from 'lucide-react';

export const TicketModal: React.FC = () => {
  const { latestOrder, isTicketModalOpen, setIsTicketModalOpen, setActiveTab } = useCafe();

  if (!isTicketModalOpen || !latestOrder) return null;

  const handleGoToQueue = () => {
    setIsTicketModalOpen(false);
    setActiveTab('queue');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sumi-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="max-w-md w-full my-8 space-y-4">
        
        {/* Success Banner */}
        <div className="bg-washi-50 border border-washi-200 rounded-2xl p-4 shadow-zen flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sumi-900 text-sm">Ticket Dispensed! (発券完了)</h3>
              <p className="text-[11px] text-sumi-500">Your order has been routed to the kitchen stations.</p>
            </div>
          </div>
          <button
            onClick={() => setIsTicketModalOpen(false)}
            className="w-7 h-7 rounded-full bg-washi-200 hover:bg-washi-300 text-sumi-600 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Realistic Animated Printed Ticket */}
        <div className="animate-ticket-print">
          <ShokenkiTicket order={latestOrder} />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsTicketModalOpen(false)}
            className="flex-1 py-3 px-4 rounded-xl border border-washi-300 bg-washi-50 text-sumi-700 hover:bg-washi-100 text-xs font-semibold transition"
          >
            Keep Browsing (閉じる)
          </button>
          
          <button
            onClick={handleGoToQueue}
            className="flex-1 py-3 px-4 rounded-xl bg-sumi-900 hover:bg-sumi-800 text-washi-50 text-xs font-semibold tracking-wide transition shadow-sm flex items-center justify-center space-x-1.5"
          >
            <span>Live Virtual Queue (待合室)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
