import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { TableZone } from '../../types';
import { Brain, Users, Sun, Zap, CheckCircle2 } from 'lucide-react';

interface Props {
  selectedZone: TableZone | 'All';
  onSelectZone: (zone: TableZone | 'All') => void;
}

const ZONE_ICONS: Record<TableZone, React.ReactNode> = {
  Focus: <Brain className="w-4 h-4 text-emerald-700" />,
  Social: <Users className="w-4 h-4 text-hinoki-600" />,
  Window: <Sun className="w-4 h-4 text-amber-600" />,
  QuickBite: <Zap className="w-4 h-4 text-rose-600" />,
};

export const TableZoneSelector: React.FC<Props> = ({ selectedZone, onSelectZone }) => {
  const { zones, tables } = useCafe();

  const getAvailableCount = (zoneId: TableZone) => {
    return tables.filter(t => t.zone === zoneId && t.status === 'available').length;
  };

  const totalAvailable = tables.filter(t => t.status === 'available').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-hinoki-600">
            席の個性 • Table Personality
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-sumi-900 mt-1">
            Choose Your Café Experience
          </h2>
        </div>
        <div className="text-xs text-sumi-500 font-mono">
          <span className="font-bold text-emerald-700">{totalAvailable}</span> of {tables.length} seats currently available
        </div>
      </div>

      {/* Zone Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {zones.map((z) => {
          const isSelected = selectedZone === z.id;
          const availableCount = getAvailableCount(z.id);

          return (
            <button
              key={z.id}
              onClick={() => onSelectZone(isSelected ? 'All' : z.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-washi-50 border-sumi-900 shadow-zen ring-2 ring-sumi-900/10'
                  : 'bg-washi-100/70 border-washi-200 hover:bg-washi-100 hover:border-washi-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="w-8 h-8 rounded-xl bg-washi-200/80 flex items-center justify-center">
                    {ZONE_ICONS[z.id]}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-medium ${
                      availableCount > 0
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {availableCount > 0 ? `${availableCount} Open` : 'Full'}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="font-serif font-bold text-sm text-sumi-900">{z.name}</div>
                  <div className="text-[11px] text-sumi-500 font-serif">{z.japaneseName}</div>
                </div>

                <p className="text-[11px] text-sumi-600 mt-1.5 leading-relaxed line-clamp-2">
                  {z.vibe}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-washi-200 flex flex-wrap gap-1">
                {z.amenities.slice(0, 2).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] font-mono bg-washi-50 text-sumi-600 px-1.5 py-0.5 rounded border border-washi-200"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
