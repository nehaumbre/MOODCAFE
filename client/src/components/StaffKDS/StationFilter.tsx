import React from 'react';
import { PreparationStation } from '../../types';
import { Coffee, Leaf, Flame, Utensils, LayoutGrid } from 'lucide-react';

interface Props {
  selectedStation: PreparationStation | 'All';
  onSelectStation: (station: PreparationStation | 'All') => void;
}

const STATIONS: { id: PreparationStation | 'All'; name: string; japanese: string; icon: React.ReactNode }[] = [
  { id: 'All', name: 'All Stations', japanese: '全厨房', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { id: 'Espresso', name: 'Espresso Bar', japanese: '珈琲処', icon: <Coffee className="w-3.5 h-3.5" /> },
  { id: 'MatchaTea', name: 'Matcha & Tea', japanese: '茶房', icon: <Leaf className="w-3.5 h-3.5" /> },
  { id: 'HotKitchen', name: 'Hot Kitchen', japanese: '熱厨房', icon: <Flame className="w-3.5 h-3.5" /> },
  { id: 'ColdPrep', name: 'Bakery & Cold', japanese: '冷製・甘味', icon: <Utensils className="w-3.5 h-3.5" /> },
];

export const StationFilter: React.FC<Props> = ({ selectedStation, onSelectStation }) => {
  return (
    <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
      {STATIONS.map((s) => {
        const isSelected = selectedStation === s.id;
        return (
          <button
            key={s.id}
            onClick={() => onSelectStation(s.id)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
              isSelected
                ? 'bg-sumi-900 text-washi-50 border-sumi-900 shadow-xs'
                : 'bg-washi-50 text-sumi-600 border-washi-200 hover:bg-washi-100 hover:text-sumi-900'
            }`}
          >
            <span>{s.icon}</span>
            <span className="font-semibold">{s.name}</span>
            <span className="text-[10px] opacity-75 font-serif">{s.japanese}</span>
          </button>
        );
      })}
    </div>
  );
};
