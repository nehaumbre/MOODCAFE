import React from 'react';
import { Order, OrderStatus, PreparationStation } from '../../types';
import { useCafe } from '../../context/CafeContext';
import { Clock, Check, Bell, Flame, Coffee, Leaf, Utensils, ArrowRight } from 'lucide-react';

interface Props {
  order: Order;
  activeStation: PreparationStation | 'All';
}

const STATION_ICONS: Record<PreparationStation, React.ReactNode> = {
  Espresso: <Coffee className="w-3 h-3 text-hinoki-700" />,
  MatchaTea: <Leaf className="w-3 h-3 text-matcha-700" />,
  HotKitchen: <Flame className="w-3 h-3 text-sakura-600" />,
  ColdPrep: <Utensils className="w-3 h-3 text-aizome-600" />,
};

export const OrderTicketCard: React.FC<Props> = ({ order, activeStation }) => {
  const { advanceOrderStatus, updateStationStatus, playChime } = useCafe();

  const isStationRelevant = activeStation === 'All'
    ? true
    : order.items.some(i => i.preparationStation === activeStation);

  if (!isStationRelevant) return null;

  const relevantItems = activeStation === 'All'
    ? order.items
    : order.items.filter(i => i.preparationStation === activeStation);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return <span className="bg-washi-200 text-sumi-800 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">受注 NEW</span>;
      case 'preparing':
        return <span className="bg-amber-100 text-amber-900 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">調理中 PREP</span>;
      case 'plating':
        return <span className="bg-purple-100 text-purple-900 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">仕上げ PLATING</span>;
      case 'ready':
        return <span className="bg-emerald-100 text-emerald-900 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">お呼出 READY</span>;
      case 'completed':
        return <span className="bg-sumi-100 text-sumi-500 text-[10px] font-mono px-2 py-0.5 rounded-full">完了 DONE</span>;
      default:
        return null;
    }
  };

  const handleAdvance = async (targetStatus: OrderStatus) => {
    if (targetStatus === 'ready') {
      playChime();
    }
    await advanceOrderStatus(order.id, targetStatus);
  };

  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000));

  return (
    <div
      className={`bg-washi-50 border rounded-2xl p-4 shadow-sm transition-all duration-200 flex flex-col justify-between ${
        order.status === 'ready'
          ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/20'
          : order.status === 'preparing'
          ? 'border-amber-300 ring-1 ring-amber-500/10'
          : 'border-washi-300'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-washi-200">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xl font-extrabold text-sumi-900 tracking-wider">
                {order.ticketNumber}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <div className="text-xs text-sumi-600 font-medium mt-0.5 flex items-center space-x-2">
              <span>{order.customerName}</span>
              <span className="text-sumi-300">•</span>
              <span className="font-serif text-matcha-700">{order.mood} Mood</span>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold uppercase ${
                order.orderType === 'dine-in' ? 'bg-hinoki-100 text-hinoki-800' : 'bg-washi-200 text-sumi-700'
              }`}
            >
              {order.orderType === 'dine-in' ? `Table ${order.tableId || 'Seat'}` : 'Takeaway'}
            </span>
            <div className="text-[10px] text-sumi-400 font-mono mt-1 flex items-center justify-end space-x-1">
              <Clock className="w-2.5 h-2.5" />
              <span>{minutesAgo}m ago</span>
            </div>
          </div>
        </div>

        {/* Item List */}
        <div className="py-3 space-y-2 border-b border-washi-200">
          {relevantItems.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between text-xs">
              <div className="space-y-0.5 pr-2">
                <div className="font-bold text-sumi-900 flex items-center space-x-1.5">
                  <span className="font-mono text-sumi-700">{item.quantity}x</span>
                  <span>{item.name}</span>
                  <span className="text-[10px] font-mono text-sumi-500 font-normal">({item.size})</span>
                </div>
                <div className="text-[10px] text-sumi-500 font-serif">
                  {item.japaneseName}
                </div>

                {/* Modifiers */}
                {item.customization && (
                  <div className="text-[10px] font-mono text-sumi-600 flex flex-wrap gap-1 mt-0.5">
                    {item.customization.temperature && <span>[{item.customization.temperature}]</span>}
                    {item.customization.milk && <span>[{item.customization.milk}]</span>}
                    {item.customization.sweetness && <span>[Sweet: {item.customization.sweetness}]</span>}
                    {item.customization.iceLevel && <span>[Ice: {item.customization.iceLevel}]</span>}
                    {item.customization.specialNote && (
                      <span className="text-rose-700 font-semibold italic">Note: "{item.customization.specialNote}"</span>
                    )}
                  </div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <span className="text-[10px] font-mono text-sumi-500 bg-washi-100 px-1.5 py-0.5 rounded border border-washi-200">
                  {item.preparationStation}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Station progress badges */}
        <div className="py-2.5 flex flex-wrap gap-1.5 text-[10px] font-mono">
          {order.stationProgress.map((sp, idx) => (
            <div
              key={idx}
              className={`px-2 py-0.5 rounded-md border flex items-center space-x-1 ${
                sp.status === 'ready'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : sp.status === 'in_prep'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-washi-100 text-sumi-500 border-washi-200'
              }`}
            >
              {STATION_ICONS[sp.station]}
              <span>{sp.station}: {sp.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Progression Buttons */}
      <div className="pt-3 border-t border-washi-200 flex items-center justify-between gap-2">
        {order.status === 'received' && (
          <button
            onClick={() => handleAdvance('preparing')}
            className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-washi-50 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <span>Start Prep (調理開始)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {order.status === 'preparing' && (
          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAdvance('plating')}
              className="py-2 px-3 bg-purple-700 hover:bg-purple-800 text-washi-50 rounded-xl text-xs font-bold transition text-center shadow-xs"
            >
              Plating (仕上げ)
            </button>
            <button
              onClick={() => handleAdvance('ready')}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-washi-50 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 shadow-xs"
            >
              <Bell className="w-3 h-3" />
              <span>Call (呼出)</span>
            </button>
          </div>
        )}

        {order.status === 'plating' && (
          <button
            onClick={() => handleAdvance('ready')}
            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-washi-50 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Bell className="w-4 h-4" />
            <span>Mark Ready & Chime (お呼出)</span>
          </button>
        )}

        {order.status === 'ready' && (
          <button
            onClick={() => handleAdvance('completed')}
            className="w-full py-2 px-3 bg-sumi-900 hover:bg-sumi-800 text-washi-50 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-xs"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Hand Over & Complete (受渡完了)</span>
          </button>
        )}

        {order.status === 'completed' && (
          <span className="text-[11px] font-mono text-sumi-400 text-center w-full py-1">
            Order Archived (完了済み)
          </span>
        )}
      </div>

    </div>
  );
};
