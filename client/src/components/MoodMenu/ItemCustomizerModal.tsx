import React, { useState } from 'react';
import { CartItem, MenuItem } from '../../types';
import { X, Check, Coffee } from 'lucide-react';

interface Props {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (size: 'R' | 'L', customization: CartItem['customization']) => void;
}

export const ItemCustomizerModal: React.FC<Props> = ({ item, onClose, onConfirm }) => {
  const [size, setSize] = useState<'R' | 'L'>('R');
  const [temperature, setTemperature] = useState<'Hot' | 'Iced'>(
    item.temperatureOptions?.includes('Hot') ? 'Hot' : 'Iced'
  );
  const [milk, setMilk] = useState<'Oat Milk' | 'Almond Milk' | 'Full Cream' | 'Soy Milk'>('Oat Milk');
  const [sweetness, setSweetness] = useState<'0%' | '25%' | '50%' | '100%'>('25%');
  const [iceLevel, setIceLevel] = useState<'Less Ice' | 'Normal' | 'No Ice'>('Normal');
  const [specialNote, setSpecialNote] = useState('');

  const currentPrice = size === 'L' && item.priceLarge ? item.priceLarge : item.priceRegular;
  const isBeverage = item.preparationStation === 'Espresso' || item.preparationStation === 'MatchaTea' || item.preparationStation === 'ColdPrep';

  const handleConfirm = () => {
    onConfirm(size, {
      temperature: item.temperatureOptions && item.temperatureOptions.length > 1 ? temperature : item.temperatureOptions?.[0],
      milk: isBeverage ? milk : undefined,
      sweetness: isBeverage ? sweetness : undefined,
      iceLevel: temperature === 'Iced' ? iceLevel : undefined,
      specialNote: specialNote.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sumi-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-washi-50 border border-washi-300 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-washi-200 flex items-start justify-between bg-washi-100/50">
          <div>
            <div className="text-[11px] font-mono text-sumi-500 uppercase tracking-widest">{item.category}</div>
            <h3 className="text-lg font-serif font-bold text-sumi-900 mt-0.5">{item.name}</h3>
            <div className="text-xs text-sumi-500 font-serif">{item.japaneseName}</div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-washi-200 hover:bg-washi-300 text-sumi-700 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customization Options */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          
          {/* Size Choice */}
          {item.priceLarge && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
                サイズ • Size Selection
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSize('R')}
                  className={`p-3 rounded-xl border text-left transition flex justify-between items-center ${
                    size === 'R'
                      ? 'border-sumi-900 bg-washi-100 font-bold text-sumi-900'
                      : 'border-washi-200 bg-washi-50 text-sumi-600'
                  }`}
                >
                  <div>
                    <div className="text-xs">Regular (レギュラー)</div>
                    <div className="text-[11px] text-sumi-500 font-normal">Standard cup</div>
                  </div>
                  <span className="font-mono text-xs">₹{item.priceRegular}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSize('L')}
                  className={`p-3 rounded-xl border text-left transition flex justify-between items-center ${
                    size === 'L'
                      ? 'border-sumi-900 bg-washi-100 font-bold text-sumi-900'
                      : 'border-washi-200 bg-washi-50 text-sumi-600'
                  }`}
                >
                  <div>
                    <div className="text-xs">Large (ラージ)</div>
                    <div className="text-[11px] text-sumi-500 font-normal">Extra serving</div>
                  </div>
                  <span className="font-mono text-xs">₹{item.priceLarge}</span>
                </button>
              </div>
            </div>
          )}

          {/* Temperature Choice (Hot / Iced) */}
          {item.temperatureOptions && item.temperatureOptions.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
                温度 • Temperature
              </label>
              <div className="grid grid-cols-2 gap-2">
                {item.temperatureOptions.map((temp) => (
                  <button
                    key={temp}
                    type="button"
                    onClick={() => setTemperature(temp)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition text-center ${
                      temperature === temp
                        ? 'border-sumi-900 bg-sumi-900 text-washi-50'
                        : 'border-washi-200 bg-washi-50 text-sumi-700 hover:bg-washi-100'
                    }`}
                  >
                    {temp === 'Hot' ? '🔥 Hot (温かい)' : '❄️ Iced (冷たい)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Milk Selection */}
          {isBeverage && !item.name.includes('Cold Brew') && !item.name.includes('Americano') && !item.name.includes('Lemonade') && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
                ミルク • Milk Preference
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(['Oat Milk', 'Almond Milk', 'Full Cream', 'Soy Milk'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMilk(m)}
                    className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                      milk === m
                        ? 'border-matcha-700 bg-matcha-50 text-matcha-900 font-medium'
                        : 'border-washi-200 bg-washi-50 text-sumi-600 hover:bg-washi-100'
                    }`}
                  >
                    <span>{m}</span>
                    {milk === m && <Check className="w-3.5 h-3.5 text-matcha-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sweetness */}
          {isBeverage && !item.name.includes('Americano') && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
                甘さ • Sweetness Level
              </label>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(['0%', '25%', '50%', '100%'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSweetness(lvl)}
                    className={`py-2 rounded-xl border font-medium text-center transition ${
                      sweetness === lvl
                        ? 'border-sumi-900 bg-sumi-900 text-washi-50'
                        : 'border-washi-200 bg-washi-50 text-sumi-700 hover:bg-washi-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Ice Level if Iced */}
          {temperature === 'Iced' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
                氷の量 • Ice Level
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Less Ice', 'Normal', 'No Ice'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setIceLevel(lvl)}
                    className={`py-2 rounded-xl border font-medium text-center transition ${
                      iceLevel === lvl
                        ? 'border-aizome-500 bg-aizome-50 text-aizome-600'
                        : 'border-washi-200 bg-washi-50 text-sumi-700 hover:bg-washi-100'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-sumi-700 uppercase tracking-wider block">
              特記事項 • Barista Note
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, separate dressing, etc."
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-washi-200 bg-washi-50 focus:outline-none focus:border-sumi-900"
            />
          </div>

        </div>

        {/* Footer with Price & Confirm */}
        <div className="p-4 bg-washi-100/70 border-t border-washi-200 flex items-center justify-between">
          <div>
            <div className="text-[10px] text-sumi-500 uppercase tracking-wider">Total Item Price</div>
            <div className="text-lg font-mono font-bold text-sumi-900">₹{currentPrice}</div>
          </div>
          <button
            onClick={handleConfirm}
            className="bg-matcha-700 hover:bg-matcha-800 text-washi-50 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition shadow-sm active:scale-95"
          >
            Add to Ticket (追加)
          </button>
        </div>

      </div>
    </div>
  );
};
