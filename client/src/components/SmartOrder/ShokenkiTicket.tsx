import React from 'react';
import { Order, PreparationStation } from '../../types';
import { Clock, Coffee, Leaf, Flame, Utensils, CheckCircle } from 'lucide-react';

interface Props {
  order: Order;
  compact?: boolean;
}

const STATION_ICONS: Record<PreparationStation, React.ReactNode> = {
  Espresso: <Coffee className="w-3.5 h-3.5 text-hinoki-700" />,
  MatchaTea: <Leaf className="w-3.5 h-3.5 text-matcha-700" />,
  HotKitchen: <Flame className="w-3.5 h-3.5 text-sakura-600" />,
  ColdPrep: <Utensils className="w-3.5 h-3.5 text-aizome-600" />,
};

export const ShokenkiTicket: React.FC<Props> = ({ order, compact = false }) => {
  const isReady = order.status === 'ready';
  const isCompleted = order.status === 'completed';

  return (
    <div className="relative ticket-perforated bg-washi-50 border border-washi-300 rounded-2xl p-5 shadow-ticket max-w-sm mx-auto overflow-hidden font-sans text-sumi-900">
      
      {/* Decorative Shōkenki Header */}
      <div className="text-center border-b-2 border-dashed border-washi-300 pb-3">
        <div className="flex items-center justify-center space-x-1.5 text-xs font-serif font-bold text-sumi-800 tracking-wider">
          <span>食券</span>
          <span>•</span>
          <span>MOOD CAFÉ TICKET</span>
          <span>•</span>
          <span>整理券</span>
        </div>
        <div className="text-[10px] text-sumi-500 font-mono tracking-widest uppercase mt-0.5">
          Japanese Smart Order Ticket
        </div>

        {/* Large Digital Order Number */}
        <div className="my-2.5 py-1 px-4 bg-sumi-900 text-washi-50 rounded-xl inline-block shadow-sm">
          <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-wider">
            {order.ticketNumber}
          </span>
        </div>

        <div className="flex items-center justify-center space-x-3 text-xs font-mono text-sumi-600">
          <span>{order.orderType === 'dine-in' ? '店内 Dine-in' : '持帰 Takeaway'}</span>
          {order.tableId && (
            <span className="font-bold text-sumi-900 bg-washi-200 px-1.5 py-0.5 rounded">
              Table {order.tableId}
            </span>
          )}
          <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* Hanko Stamp Overlay (Japanese Seal) */}
      <div className="absolute top-8 right-5 pointer-events-none">
        {isReady ? (
          <div className="hanko-stamp px-2 py-0.5 text-xs border-sakura-600 text-sakura-600 animate-pulse">
            お呼出 READY
          </div>
        ) : isCompleted ? (
          <div className="hanko-stamp px-2 py-0.5 text-xs border-sumi-500 text-sumi-500">
            受渡済 DONE
          </div>
        ) : (
          <div className="hanko-stamp px-2 py-0.5 text-xs">
            調理中 PREP
          </div>
        )}
      </div>

      {/* Customer & Mood Details */}
      <div className="py-3 border-b border-washi-200 text-xs flex justify-between items-center">
        <div>
          <span className="text-[10px] text-sumi-400 font-mono block">GUEST</span>
          <span className="font-bold text-sumi-800">{order.customerName}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-sumi-400 font-mono block">MOOD</span>
          <span className="font-serif font-bold text-matcha-700">{order.mood}</span>
        </div>
      </div>

      {/* Items Breakdown */}
      <div className="py-3 border-b-2 border-dashed border-washi-300 space-y-2.5">
        <div className="text-[10px] font-mono font-semibold text-sumi-400 uppercase tracking-widest">
          ORDER ITEMS (品目)
        </div>

        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between text-xs">
            <div className="space-y-0.5 pr-2">
              <div className="font-bold text-sumi-900 leading-tight">
                {item.quantity}x {item.name} ({item.size})
              </div>
              <div className="text-[10px] text-sumi-500 font-serif">
                {item.japaneseName}
              </div>
              
              {/* Customization Details */}
              {item.customization && (
                <div className="text-[10px] text-sumi-600 font-mono flex flex-wrap gap-1 mt-0.5">
                  {item.customization.temperature && <span>[{item.customization.temperature}]</span>}
                  {item.customization.milk && <span>[{item.customization.milk}]</span>}
                  {item.customization.sweetness && <span>[Sweet: {item.customization.sweetness}]</span>}
                  {item.customization.iceLevel && <span>[Ice: {item.customization.iceLevel}]</span>}
                </div>
              )}
            </div>
            <div className="font-mono font-medium text-sumi-800 text-right shrink-0">
              ₹{item.unitPrice * item.quantity}
            </div>
          </div>
        ))}
      </div>

      {/* Kitchen Station Routing Breakdown */}
      <div className="py-3 border-b border-washi-200 space-y-1.5">
        <div className="text-[10px] font-mono font-semibold text-sumi-400 uppercase tracking-wider">
          STATION ROUTING (厨房割当)
        </div>
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
          {order.stationProgress.map((sp, idx) => (
            <div
              key={idx}
              className={`p-1.5 rounded-lg border flex items-center justify-between ${
                sp.status === 'ready'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : sp.status === 'in_prep'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-washi-100 border-washi-200 text-sumi-600'
              }`}
            >
              <div className="flex items-center space-x-1 truncate">
                {STATION_ICONS[sp.station]}
                <span className="truncate">{sp.station}</span>
              </div>
              <span className="text-[9px] font-bold uppercase ml-1">
                {sp.status === 'ready' ? '✓' : sp.status === 'in_prep' ? 'Prep' : 'Wait'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Total & Estimated Prep Time */}
      <div className="pt-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-sumi-400 font-mono">TOTAL AMOUNT</div>
          <div className="font-mono text-xl font-bold text-sumi-900">₹{order.totalAmount}</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-sumi-400 font-mono flex items-center justify-end space-x-1">
            <Clock className="w-3 h-3 text-matcha-600" />
            <span>EST. WAIT</span>
          </div>
          <div className="font-mono text-base font-bold text-matcha-700">
            {order.status === 'ready' ? 'Ready Now!' : `~${order.estimatedMinutes} mins`}
          </div>
        </div>
      </div>

      {/* Barcode & Hanko seal footer */}
      <div className="mt-4 pt-3 border-t border-washi-200 flex flex-col items-center">
        {/* Visual Barcode */}
        <div className="font-mono text-[9px] tracking-[6px] text-sumi-400 select-none">
          ||| | ||||| | |||| || ||||| ||| |||
        </div>
        <div className="text-[9px] font-mono text-sumi-400 mt-1">
          MOOD-SYS-2026-CLOUD-RUN
        </div>
      </div>

    </div>
  );
};
