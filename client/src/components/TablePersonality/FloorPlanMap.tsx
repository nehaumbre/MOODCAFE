import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Table, TableZone } from '../../types';
import { Check, Sparkles, Coffee, Trees, Sun, Brain } from 'lucide-react';

interface Props {
  selectedZone: TableZone | 'All';
  onSelectTable: (table: Table) => void;
}

export const FloorPlanMap: React.FC<Props> = ({ selectedZone, onSelectTable }) => {
  const { tables, selectedTable } = useCafe();

  const getStatusColor = (status: Table['status'], isSelected: boolean) => {
    if (isSelected) return 'bg-sumi-900 text-washi-50 border-sumi-900 ring-2 ring-sumi-900/20';
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100 hover:scale-105';
      case 'occupied':
        return 'bg-amber-50 text-amber-800 border-amber-200 opacity-80 cursor-not-allowed';
      case 'reserved':
        return 'bg-purple-50 text-purple-800 border-purple-200 opacity-80 cursor-not-allowed';
    }
  };

  const getStatusLabel = (status: Table['status']) => {
    switch (status) {
      case 'available': return '空席 Open';
      case 'occupied': return '満席 Busy';
      case 'reserved': return '予約 Reserved';
    }
  };

  const filterMatches = (zone: TableZone) => selectedZone === 'All' || selectedZone === zone;

  return (
    <div className="bg-washi-100/80 border border-washi-200 rounded-3xl p-5 space-y-4">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-washi-200 pb-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-widest text-sumi-500">Live Spatial Map</div>
          <h3 className="font-serif font-bold text-base text-sumi-900">Café Architectural Floor Plan (座席図)</h3>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-sumi-600">Available (空)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-sumi-600">Occupied (満)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-sumi-600">Reserved (予)</span>
          </div>
        </div>
      </div>

      {/* Interactive Floor Plan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* NORTH: Window Seat (Komorebi Counter) */}
        <div className={`md:col-span-12 p-3.5 rounded-2xl border transition-all ${
          filterMatches('Window') ? 'bg-washi-50 border-amber-200/80 shadow-xs' : 'bg-washi-50/50 border-washi-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-amber-800">
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Komorebi Window Counter (木漏れ日カウンター)</span>
            </div>
            <span className="text-[10px] text-sumi-400 font-mono">Street & Garden View</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tables.filter(t => t.zone === 'Window').map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isAvailable = table.status === 'available';

              return (
                <button
                  key={table.id}
                  disabled={!isAvailable && !isSelected}
                  onClick={() => onSelectTable(table)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${getStatusColor(table.status, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{table.id}</span>
                    <span className="text-[10px]">{getStatusLabel(table.status)}</span>
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">{table.name}</div>
                  <div className="text-[10px] text-sumi-500 font-mono mt-0.5">{table.capacity} Seat</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* WEST: Focus Zone Study Alcoves */}
        <div className={`md:col-span-5 p-3.5 rounded-2xl border transition-all ${
          filterMatches('Focus') ? 'bg-washi-50 border-emerald-200/80 shadow-xs' : 'bg-washi-50/50 border-washi-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-800">
              <Brain className="w-3.5 h-3.5 text-emerald-700" />
              <span>Focus Alcoves (集中ブース)</span>
            </div>
            <span className="text-[10px] text-sumi-400 font-mono">Silent Nooks</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tables.filter(t => t.zone === 'Focus').map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isAvailable = table.status === 'available';

              return (
                <button
                  key={table.id}
                  disabled={!isAvailable && !isSelected}
                  onClick={() => onSelectTable(table)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${getStatusColor(table.status, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{table.id}</span>
                    <span className="text-[10px]">{getStatusLabel(table.status)}</span>
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">{table.name}</div>
                  <div className="text-[10px] text-sumi-500 font-mono mt-0.5">Plug & Light</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* CENTER / EAST: Zen Rock Courtyard & Social Tables */}
        <div className={`md:col-span-7 p-3.5 rounded-2xl border transition-all ${
          filterMatches('Social') ? 'bg-washi-50 border-hinoki-200 shadow-xs' : 'bg-washi-50/50 border-washi-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-hinoki-700">
              <Trees className="w-3.5 h-3.5 text-hinoki-600" />
              <span>Rock Courtyard & Social Zone (和みテーブル)</span>
            </div>
            <span className="text-[10px] text-sumi-400 font-mono">Communal Seating</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {tables.filter(t => t.zone === 'Social').map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isAvailable = table.status === 'available';

              return (
                <button
                  key={table.id}
                  disabled={!isAvailable && !isSelected}
                  onClick={() => onSelectTable(table)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${getStatusColor(table.status, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{table.id}</span>
                    <span className="text-[10px]">{getStatusLabel(table.status)}</span>
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">{table.name}</div>
                  <div className="text-[10px] text-sumi-500 font-mono mt-0.5">{table.capacity} Person Table</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SOUTH: Barista Station & Quick Bite Standing Bar */}
        <div className={`md:col-span-12 p-3.5 rounded-2xl border transition-all ${
          filterMatches('QuickBite') ? 'bg-washi-50 border-rose-200/80 shadow-xs' : 'bg-washi-50/50 border-washi-200 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-rose-800">
              <Coffee className="w-3.5 h-3.5 text-rose-600" />
              <span>Barista Counter & Quick Bite (立ち飲み・急ぎ席)</span>
            </div>
            <span className="text-[10px] text-sumi-400 font-mono">Immediate Barista Access</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {tables.filter(t => t.zone === 'QuickBite').map(table => {
              const isSelected = selectedTable?.id === table.id;
              const isAvailable = table.status === 'available';

              return (
                <button
                  key={table.id}
                  disabled={!isAvailable && !isSelected}
                  onClick={() => onSelectTable(table)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${getStatusColor(table.status, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs">{table.id}</span>
                    <span className="text-[10px]">{getStatusLabel(table.status)}</span>
                  </div>
                  <div className="text-[11px] font-medium mt-1 truncate">{table.name}</div>
                  <div className="text-[10px] text-sumi-500 font-mono mt-0.5">Express Stand</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Selected Table Indicator Banner */}
      {selectedTable && (
        <div className="bg-sumi-900 text-washi-50 p-3.5 rounded-2xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-lg bg-matcha-600 flex items-center justify-center font-bold text-xs font-mono">
              {selectedTable.id}
            </div>
            <div>
              <div className="text-xs font-bold font-serif">{selectedTable.name} Selected</div>
              <div className="text-[10px] text-washi-300 font-mono">
                {selectedTable.zone} Zone • {selectedTable.capacity} Seat(s) • Linked to your order
              </div>
            </div>
          </div>
          <button
            onClick={() => onSelectTable(null as any)}
            className="text-[11px] underline text-washi-300 hover:text-washi-100"
          >
            Clear Selection
          </button>
        </div>
      )}

    </div>
  );
};
