import React, { useState, useEffect } from 'react';
import { useCafe } from '../../context/CafeContext';
import { ShokenkiTicket } from '../SmartOrder/ShokenkiTicket';
import { Clock, CheckCircle2, Bell, AlertCircle, Sparkles, ChefHat, Volume2 } from 'lucide-react';
import { OrderStatus } from '../../types';

const STEPS: { id: OrderStatus; label: string; japanese: string; desc: string }[] = [
  { id: 'received', label: 'Received', japanese: '受注', desc: 'Ticket registered & routed' },
  { id: 'preparing', label: 'Preparing', japanese: '調理中', desc: 'Active at barista & kitchen stations' },
  { id: 'plating', label: 'Plating', japanese: '仕上げ', desc: 'Final garnish & assembly' },
  { id: 'ready', label: 'Ready', japanese: 'お呼出', desc: 'Counter / Table ready for pickup' },
  { id: 'completed', label: 'Completed', japanese: '完了', desc: 'Enjoy your mindful nourishment' },
];

export const QueueTracker: React.FC = () => {
  const { latestOrder, queue, playChime, setActiveTab } = useCafe();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // Synchronize countdown based on order.estimatedMinutes
  useEffect(() => {
    if (latestOrder && latestOrder.status !== 'completed' && latestOrder.status !== 'ready') {
      const mins = latestOrder.estimatedMinutes || 5;
      setSecondsRemaining(mins * 60);

      const interval = setInterval(() => {
        setSecondsRemaining(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [latestOrder]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received': return 0;
      case 'preparing': return 1;
      case 'plating': return 2;
      case 'ready': return 3;
      case 'completed': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = latestOrder ? getStepIndex(latestOrder.status) : -1;
  const isReady = latestOrder?.status === 'ready';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-sakura-600 flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>仮想待合室 • Live Virtual Queue</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-sumi-900 mt-1">
            Order Progress & Queue Status
          </h2>
        </div>

        {/* Audio Chime Test Button */}
        <button
          onClick={playChime}
          className="inline-flex items-center space-x-1.5 text-xs text-sumi-600 hover:text-sumi-900 bg-washi-100 px-3 py-1.5 rounded-xl border border-washi-200 transition"
          title="Play Japanese temple bell chime"
        >
          <Volume2 className="w-3.5 h-3.5 text-matcha-700" />
          <span>Test Bell Chime (合図音)</span>
        </button>
      </div>

      {/* Main Order Tracker Card */}
      {latestOrder ? (
        <div className="bg-washi-50 border border-washi-300 rounded-3xl p-6 shadow-zen space-y-6">
          
          {/* Order Highlight Top Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-washi-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sumi-900 text-washi-50 flex items-center justify-center font-mono font-extrabold text-lg shadow-sm">
                {latestOrder.ticketNumber}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-serif font-bold text-sumi-900 text-base">{latestOrder.customerName}</span>
                  <span className="text-[10px] font-mono bg-washi-200 text-sumi-700 px-2 py-0.5 rounded-full">
                    {latestOrder.orderType === 'dine-in' ? `Table ${latestOrder.tableId || 'Seat'}` : 'Takeaway'}
                  </span>
                </div>
                <div className="text-xs text-sumi-500 font-mono mt-0.5">
                  Mood: <span className="text-matcha-700 font-bold">{latestOrder.mood}</span> • {latestOrder.items.length} item(s)
                </div>
              </div>
            </div>

            {/* Live Queue Position Badge */}
            <div className="flex items-center space-x-3 bg-washi-100 p-2.5 rounded-2xl border border-washi-200">
              <div className="text-right">
                <div className="text-[10px] text-sumi-500 font-mono">QUEUE POSITION</div>
                <div className="font-mono font-bold text-sm text-sumi-900">
                  {isReady ? 'Front of Line' : `№ ${latestOrder.queuePosition || 1} in queue`}
                </div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-washi-50 border border-washi-300 flex items-center justify-center font-mono font-bold text-sumi-800">
                {isReady ? '0' : (latestOrder.queuePosition || 1)}
              </div>
            </div>
          </div>

          {/* Ready Banner Alert */}
          {isReady && (
            <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex items-center justify-between animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-washi-50 flex items-center justify-center">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-emerald-900 text-sm sm:text-base">
                    お呼出 • Order Ready for Collection!
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Please collect your order at the Barista pickup counter with ticket <span className="font-mono font-bold">{latestOrder.ticketNumber}</span>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5-Step Visual Progression Flow */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-semibold text-sumi-500 uppercase tracking-wider">
              Preparation Lifecycle (進行状況)
            </div>

            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {STEPS.map((step, idx) => {
                const isPassed = currentStepIdx >= idx;
                const isCurrent = currentStepIdx === idx;

                return (
                  <div
                    key={step.id}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-sumi-900 text-washi-50 border-sumi-900 ring-2 ring-sumi-900/10 shadow-xs'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-washi-100 text-sumi-400 border-washi-200'
                    }`}
                  >
                    <div className="font-mono font-bold text-[10px] opacity-75">
                      0{idx + 1}
                    </div>
                    <div className="font-serif font-bold text-xs mt-1 truncate">
                      {step.japanese}
                    </div>
                    <div className="text-[10px] hidden sm:block truncate mt-0.5">
                      {step.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estimated Wait Countdown */}
          {!isReady && latestOrder.status !== 'completed' && (
            <div className="bg-washi-100/70 p-4 rounded-2xl border border-washi-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-washi-200 flex items-center justify-center text-sumi-700">
                  <Clock className="w-4 h-4 text-matcha-700" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sumi-900">Live Estimated Time Remaining</div>
                  <div className="text-[11px] text-sumi-500">Auto-adjusted for station queue depth</div>
                </div>
              </div>

              <div className="font-mono font-extrabold text-2xl text-matcha-800 tracking-wider">
                {secondsRemaining > 0 ? formatCountdown(secondsRemaining) : '~1 min'}
              </div>
            </div>
          )}

          {/* Station Status Breakdown */}
          <div className="space-y-2 pt-2 border-t border-washi-200">
            <div className="text-xs font-mono font-semibold text-sumi-500 uppercase tracking-wider">
              Station Breakdown (各担当の進捗)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {latestOrder.stationProgress.map((sp, idx) => (
                <div
                  key={idx}
                  className="bg-washi-100/60 p-3 rounded-xl border border-washi-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-serif font-bold text-xs text-sumi-900">{sp.stationName}</div>
                    <div className="text-[10px] text-sumi-500 font-mono">{sp.itemCount} item(s) routed</div>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      sp.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : sp.status === 'in_prep'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-washi-200 text-sumi-600'
                    }`}
                  >
                    {sp.status === 'ready' ? 'Ready ✓' : sp.status === 'in_prep' ? 'In Prep 🍳' : 'Pending ⏳'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-washi-50 border border-washi-200 rounded-3xl p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-washi-100 flex items-center justify-center text-sumi-400 mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-sumi-800 text-base">No Active Ticket in Queue</h3>
          <p className="text-xs text-sumi-500 max-w-sm mx-auto">
            You don't have an order in progress yet. Browse the Mood Menu, select a seating experience, and issue your digital ticket.
          </p>
          <button
            onClick={() => setActiveTab('menu')}
            className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-sumi-900 text-washi-50 text-xs font-semibold hover:bg-sumi-800 transition shadow-xs"
          >
            <span>Explore Mood Menu (メニューへ)</span>
          </button>
        </div>
      )}

      {/* Live Café Queue Board */}
      <div className="bg-washi-100/60 border border-washi-200 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-sumi-400 uppercase tracking-widest">Public Waiting List</div>
            <h3 className="font-serif font-bold text-sumi-900 text-sm">Active Café Tickets (待合順)</h3>
          </div>
          <span className="text-xs font-mono text-sumi-500">{queue.length} ticket(s) currently being prepared</span>
        </div>

        <div className="divide-y divide-washi-200 bg-washi-50 rounded-2xl border border-washi-200 overflow-hidden">
          {queue.length === 0 ? (
            <div className="p-4 text-center text-xs text-sumi-400 font-mono">
              The kitchen queue is clear. Fast turnaround!
            </div>
          ) : (
            queue.map((entry, idx) => {
              const isMyTicket = latestOrder?.ticketNumber === entry.ticketNumber;
              return (
                <div
                  key={idx}
                  className={`p-3 flex items-center justify-between text-xs transition ${
                    isMyTicket ? 'bg-matcha-50/60 font-semibold' : 'hover:bg-washi-100/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-washi-200 flex items-center justify-center font-mono text-[11px] font-bold text-sumi-700">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sumi-900">{entry.ticketNumber}</span>
                        {isMyTicket && (
                          <span className="text-[9px] font-bold text-matcha-700 bg-matcha-100 px-1.5 py-0.2 rounded">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-sumi-500 font-mono">
                        {entry.customerName} • {entry.itemCount} items • {entry.orderType}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                      entry.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : entry.status === 'plating'
                        ? 'bg-purple-100 text-purple-800'
                        : entry.status === 'preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-washi-200 text-sumi-600'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
};
