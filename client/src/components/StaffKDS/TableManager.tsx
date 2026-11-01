import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table } from '../../types';
import { LayoutGrid, RefreshCw } from 'lucide-react';

export const TableManager: React.FC = () => {
  const { tables, toggleTableStatus } = useCafe();

  const cycleStatus = (table: Table) => {
    const nextStatus: Record<Table['status'], Table['status']> = {
      available: 'occupied',
      occupied: 'reserved',
      reserved: 'available',
    };
    toggleTableStatus(table.id, nextStatus[table.status]);
  };

  const getStatusColor = (status: Table['status']) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'occupied':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'reserved':
        return 'bg-purple-50 text-purple-800 border-purple-300';
    }
  };

  return (
    <div className="bg-washi-100/70 border border-washi-200 rounded-3xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-washi-200 pb-3">
        <div>
          <div className="text-[10px] font-mono text-sumi-500 uppercase tracking-widest">Floor Operations</div>
          <h3 className="font-serif font-bold text-sumi-900 text-sm">Table Turnover Manager (座席管理)</h3>
        </div>
        <span className="text-[11px] text-sumi-500 font-mono">
          Click table to cycle status
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => cycleStatus(table)}
            className={`p-3 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-95 shadow-2xs ${getStatusColor(table.status)}`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs">{table.id}</span>
              <span className="text-[9px] font-mono uppercase font-bold">
                {table.status}
              </span>
            </div>
            <div className="text-xs font-semibold text-sumi-900 mt-1 truncate">{table.name}</div>
            <div className="text-[10px] text-sumi-500 font-mono mt-0.5">
              {table.zone} • {table.capacity}p
            </div>
            {table.currentOrderNumber && (
              <div className="mt-1 text-[9px] font-mono font-bold text-sumi-800 bg-washi-50/80 px-1 rounded">
                Order: {table.currentOrderNumber}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
