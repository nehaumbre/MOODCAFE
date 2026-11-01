import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Mood } from '../../types';
import { Sparkles, Brain, Heart, Zap, Droplets, Gift } from 'lucide-react';

const MOOD_ICONS: Record<Mood, React.ReactNode> = {
  Focus: <Brain className="w-4 h-4" />,
  Comfort: <Heart className="w-4 h-4" />,
  Energetic: <Zap className="w-4 h-4" />,
  Refresh: <Droplets className="w-4 h-4" />,
  Indulgence: <Gift className="w-4 h-4" />,
};

export const MoodSelector: React.FC = () => {
  const { moods, currentMood, setCurrentMood } = useCafe();
  const activeMoodMeta = moods.find(m => m.id === currentMood);

  return (
    <div className="w-full space-y-4">
      {/* Mood Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-matcha-700">
            <Sparkles className="w-3.5 h-3.5" />
            <span>気分の選択 • Select Your Mood</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-sumi-900 mt-1">
            How are you feeling today?
          </h2>
        </div>
        <p className="text-xs text-sumi-500 max-w-xs">
          Personalised drink and nourishment crafted to balance your mind and body.
        </p>
      </div>

      {/* 5 Mood Pills Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {moods.map((m) => {
          const isSelected = m.id === currentMood;
          return (
            <button
              key={m.id}
              onClick={() => setCurrentMood(m.id)}
              className={`relative text-left p-3 rounded-2xl transition-all duration-200 border flex flex-col justify-between ${
                isSelected
                  ? 'bg-washi-50 border-sumi-900 shadow-zen scale-[1.02] ring-2 ring-sumi-900/10'
                  : 'bg-washi-100/70 border-washi-200 hover:bg-washi-100 hover:border-washi-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-serif font-bold ${
                    isSelected ? 'bg-sumi-900 text-washi-50' : 'bg-washi-200 text-sumi-700'
                  }`}
                >
                  {m.kanji}
                </span>
                <span className={isSelected ? 'text-sumi-900' : 'text-sumi-400'}>
                  {MOOD_ICONS[m.id]}
                </span>
              </div>

              <div className="mt-3">
                <div className="font-serif font-bold text-sm text-sumi-900">{m.english}</div>
                <div className="text-[10px] text-sumi-500 tracking-wide font-mono">{m.romaji}</div>
              </div>

              {isSelected && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full bg-sumi-900" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Mood Banner with Sensory Notes */}
      {activeMoodMeta && (
        <div className="bg-washi-100/90 rounded-2xl p-4 border border-washi-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sumi-900 text-base">
                {activeMoodMeta.kanji} • {activeMoodMeta.english}
              </span>
              <span className="text-xs text-sumi-500 italic">
                "{activeMoodMeta.subtitle}"
              </span>
            </div>
            <p className="text-xs text-sumi-600 max-w-xl leading-relaxed">
              {activeMoodMeta.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 self-stretch sm:self-center">
            {activeMoodMeta.sensoryNotes.map((note, idx) => (
              <span
                key={idx}
                className="inline-flex items-center text-[10px] font-medium bg-washi-50 text-sumi-700 px-2.5 py-1 rounded-full border border-washi-200 shadow-sm"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
