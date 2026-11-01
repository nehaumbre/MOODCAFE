import React from 'react';
import { useCafe } from '../context/CafeContext';
import { ShoppingBag, Coffee, LayoutGrid, Clock, ChefHat, User, Sparkles } from 'lucide-react';

export const Navigation: React.FC = () => {
  const {
    viewRole,
    setViewRole,
    activeTab,
    setActiveTab,
    cartItemCount,
    cartTotal,
    setIsCartOpen,
    latestOrder,
    isConnected,
  } = useCafe();

  const isCustomer = viewRole === 'customer';
  const hasActiveOrder = latestOrder && latestOrder.status !== 'completed' && latestOrder.status !== 'cancelled';

  return (
    <header className="sticky top-0 z-40 bg-washi-50/90 backdrop-blur-md border-b border-washi-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand & Japanese Kanji Crest */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-matcha-700 text-washi-50 flex items-center justify-center shadow-zen font-serif font-bold text-lg tracking-wider">
            気
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-serif font-bold text-sumi-900 text-lg tracking-tight">Mood Café</span>
              <span className="text-xs font-medium text-sumi-500 tracking-wider">ムードカフェ</span>
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-sumi-500">
              <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{isConnected ? 'Real-time Live' : 'Connecting...'}</span>
              <span className="text-sumi-300">•</span>
              <span className="hidden sm:inline font-japanese text-sumi-400">和の空間</span>
            </div>
          </div>
        </div>

        {/* Center Navigation for Customer (Desktop & Tablet) */}
        {isCustomer && (
          <nav className="hidden md:flex items-center space-x-1 bg-washi-100 p-1 rounded-xl border border-washi-200">
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'menu'
                  ? 'bg-washi-50 text-sumi-900 shadow-sm border border-washi-300'
                  : 'text-sumi-600 hover:text-sumi-900'
              }`}
            >
              <Coffee className="w-3.5 h-3.5 text-matcha-600" />
              <span>気分 Mood Menu</span>
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'tables'
                  ? 'bg-washi-50 text-sumi-900 shadow-sm border border-washi-300'
                  : 'text-sumi-600 hover:text-sumi-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-hinoki-600" />
              <span>席 Table Personality</span>
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'queue'
                  ? 'bg-washi-50 text-sumi-900 shadow-sm border border-washi-300'
                  : 'text-sumi-600 hover:text-sumi-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-sakura-500" />
              <span>待合 Virtual Queue</span>
              {hasActiveOrder && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sakura-500 animate-ping" />
              )}
            </button>
          </nav>
        )}

        {/* Right side controls */}
        <div className="flex items-center space-x-3">
          
          {/* Dual Perspective Toggle: Customer vs Staff */}
          <div className="flex items-center bg-washi-100 p-0.5 rounded-lg border border-washi-200 text-xs font-medium">
            <button
              onClick={() => setViewRole('customer')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition-all ${
                isCustomer
                  ? 'bg-washi-50 text-sumi-900 shadow-sm font-semibold'
                  : 'text-sumi-500 hover:text-sumi-800'
              }`}
              title="Customer ordering experience"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guest</span>
            </button>
            <button
              onClick={() => setViewRole('staff')}
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-md transition-all ${
                !isCustomer
                  ? 'bg-matcha-700 text-washi-50 shadow-sm font-semibold'
                  : 'text-sumi-500 hover:text-sumi-800'
              }`}
              title="Staff Kitchen Display System (KDS)"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>KDS 厨房</span>
            </button>
          </div>

          {/* Customer Cart Button */}
          {isCustomer && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center space-x-2 bg-sumi-900 text-washi-50 px-3.5 py-2 rounded-xl text-xs font-medium hover:bg-sumi-800 transition shadow-sm active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Ticket Order</span>
              {cartItemCount > 0 && (
                <span className="inline-flex items-center justify-center bg-sakura-500 text-washi-50 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
              {cartTotal > 0 && (
                <span className="hidden sm:inline font-mono text-[11px] text-washi-200 border-l border-sumi-700 pl-2">
                  ₹{cartTotal}
                </span>
              )}
            </button>
          )}

        </div>
      </div>

      {/* Mobile Bottom Navigation for Customer */}
      {isCustomer && (
        <div className="md:hidden flex items-center justify-around border-t border-washi-200 bg-washi-50/95 py-2 px-2">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex flex-col items-center space-y-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
              activeTab === 'menu' ? 'text-matcha-700 font-bold' : 'text-sumi-500'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>気分 Menu</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex flex-col items-center space-y-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
              activeTab === 'tables' ? 'text-hinoki-600 font-bold' : 'text-sumi-500'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>席 Tables</span>
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`relative flex flex-col items-center space-y-1 text-[11px] font-medium py-1 px-3 rounded-lg ${
              activeTab === 'queue' ? 'text-sakura-600 font-bold' : 'text-sumi-500'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>待合 Queue</span>
            {hasActiveOrder && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-sakura-500 animate-ping" />
            )}
          </button>
        </div>
      )}
    </header>
  );
};
