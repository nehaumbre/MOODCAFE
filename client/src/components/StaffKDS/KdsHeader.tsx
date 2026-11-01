import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { ChefHat, RotateCcw, Clock, Coffee, AlertCircle, CheckCircle2 } from 'lucide-react';

export const KdsHeader: React.FC = () => {
  const { orders, tables, resetAllData } = useCafe();

  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const preparingCount = activeOrders.filter(o => o.status === 'preparing' || o.status === 'received').length;
  const readyCount = activeOrders.filter(o => o.status === 'ready').length;
  const occupiedTables = tables.filter(t => t.status === 'occupied').length;

  return (
    <div className="bg-sumi-900 text-washi-50 rounded-3xl p-5 shadow-zen-lg space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sumi-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-matcha-700 flex items-center justify-center shadow-xs">
            <ChefHat className="w-5 h-5 text-washi-50" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-serif font-bold text-lg text-washi-50">Kitchen Display System (KDS)</h2>
              <span className="text-xs bg-matcha-900 text-matcha-200 border border-matcha-700 px-2 py-0.5 rounded-full font-mono">
                厨房管理
              </span>
            </div>
            <p className="text-xs text-washi-300">
              Live Shōkenki ticket matching, station dispatch, and table turnover.
            </p>
          </div>
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={resetAllData}
          className="inline-flex items-center space-x-2 bg-sumi-800 hover:bg-sumi-700 text-washi-200 hover:text-washi-50 text-xs px-3.5 py-2 rounded-xl transition border border-sumi-700 active:scale-95 self-start sm:self-auto"
          title="Reset orders and tables to initial sample data"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Demo Data (初期化)</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-sumi-800/80 p-3 rounded-2xl border border-sumi-700/60">
          <div className="text-sumi-400 font-mono text-[10px] uppercase">Active Tickets</div>
          <div className="font-mono text-2xl font-bold text-washi-50 mt-0.5">
            {activeOrders.length}
          </div>
        </div>

        <div className="bg-sumi-800/80 p-3 rounded-2xl border border-sumi-700/60">
          <div className="text-amber-400 font-mono text-[10px] uppercase">Cooking / Prep</div>
          <div className="font-mono text-2xl font-bold text-amber-300 mt-0.5">
            {preparingCount}
          </div>
        </div>

        <div className="bg-sumi-800/80 p-3 rounded-2xl border border-sumi-700/60">
          <div className="text-emerald-400 font-mono text-[10px] uppercase">Ready for Pickup</div>
          <div className="font-mono text-2xl font-bold text-emerald-300 mt-0.5">
            {readyCount}
          </div>
        </div>

        <div className="bg-sumi-800/80 p-3 rounded-2xl border border-sumi-700/60">
          <div className="text-hinoki-400 font-mono text-[10px] uppercase">Occupied Seats</div>
          <div className="font-mono text-2xl font-bold text-hinoki-200 mt-0.5">
            {occupiedTables} <span className="text-xs font-normal text-sumi-400">/ {tables.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
