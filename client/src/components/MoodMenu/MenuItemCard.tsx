import React, { useState } from 'react';
import { MenuItem } from '../../types';
import { useCafe } from '../../context/CafeContext';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { Plus, SlidersHorizontal, Flame, Coffee, Leaf, Utensils, Sparkles } from 'lucide-react';

interface Props {
  item: MenuItem;
}

const STATION_ICONS: Record<string, React.ReactNode> = {
  Espresso: <Coffee className="w-3 h-3 text-hinoki-600" />,
  MatchaTea: <Leaf className="w-3 h-3 text-matcha-600" />,
  HotKitchen: <Flame className="w-3 h-3 text-sakura-500" />,
  ColdPrep: <Utensils className="w-3 h-3 text-aizome-500" />,
};

const STATION_LABELS: Record<string, string> = {
  Espresso: '珈琲処 Espresso Bar',
  MatchaTea: '茶房 Matcha & Tea',
  HotKitchen: '熱厨房 Hot Kitchen',
  ColdPrep: '冷製 Bakery & Cold',
};

export const MenuItemCard: React.FC<Props> = ({ item }) => {
  const { currentMood, addToCart } = useCafe();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPrimaryMatch = item.primaryMood === currentMood;
  const isMoodMatch = item.moods.includes(currentMood);

  const handleQuickAdd = () => {
    addToCart(item, 'R');
  };

  return (
    <>
      <div
        className={`relative bg-washi-50 rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between hover:shadow-zen ${
          isPrimaryMatch
            ? 'border-matcha-600/60 ring-1 ring-matcha-600/30 bg-gradient-to-b from-washi-50 to-matcha-50/20'
            : isMoodMatch
            ? 'border-washi-300'
            : 'border-washi-200 opacity-90'
        }`}
      >
        {/* Top Badges */}
        <div>
          <div className="flex items-center justify-between gap-1 mb-2">
            
            {/* Station Routing Badge */}
            <div className="inline-flex items-center space-x-1 text-[10px] font-mono font-medium text-sumi-600 bg-washi-100 px-2 py-0.5 rounded-md border border-washi-200">
              {STATION_ICONS[item.preparationStation]}
              <span>{STATION_LABELS[item.preparationStation]}</span>
            </div>

            {/* Mood match tag */}
            {isPrimaryMatch && (
              <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-matcha-800 bg-matcha-100 px-2 py-0.5 rounded-full border border-matcha-200 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Top {currentMood} Pick</span>
              </span>
            )}
          </div>

          {/* Item Names & Japanese Subtitle */}
          <div className="space-y-0.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-serif font-bold text-sumi-900 text-sm sm:text-base leading-snug">
                {item.name}
              </h3>
              {item.isVeg && (
                <span className="w-3.5 h-3.5 border border-emerald-600 p-0.5 flex items-center justify-center rounded-xs shrink-0 mt-0.5" title="Pure Vegetarian">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </span>
              )}
            </div>
            <p className="text-[11px] font-serif text-sumi-500">{item.japaneseName}</p>
          </div>

          {/* Description */}
          <p className="text-xs text-sumi-600 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Sensory Tags & Calorie */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {item.calories && (
              <span className="text-[10px] font-mono text-sumi-500 bg-washi-100 px-1.5 py-0.5 rounded">
                {item.calories}
              </span>
            )}
            {item.tags.slice(0, 2).map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] text-sumi-500 bg-washi-100 px-1.5 py-0.5 rounded border border-washi-200"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Price & Add Buttons */}
        <div className="pt-4 mt-3 border-t border-washi-200/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-sumi-400 font-mono">FROM</div>
            <div className="font-mono font-bold text-sumi-900 text-sm sm:text-base">
              ₹{item.priceRegular}
              {item.priceLarge && (
                <span className="text-xs font-normal text-sumi-500 ml-1">/ ₹{item.priceLarge}</span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Customize button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-1.5 rounded-lg border border-washi-300 text-sumi-700 hover:bg-washi-100 transition"
              title="Customize temperature, milk, size"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>

            {/* Quick Add */}
            <button
              onClick={handleQuickAdd}
              className="flex items-center space-x-1 bg-sumi-900 hover:bg-sumi-800 text-washi-50 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition active:scale-95 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customizer modal */}
      {isModalOpen && (
        <ItemCustomizerModal
          item={item}
          onClose={() => setIsModalOpen(false)}
          onConfirm={(size, customization) => addToCart(item, size, customization)}
        />
      )}
    </>
  );
};
