import React, { useState, useMemo } from 'react';
import { useCafe } from './context/CafeContext';
import { Navigation } from './components/Navigation';
import { MoodSelector } from './components/MoodMenu/MoodSelector';
import { MenuItemCard } from './components/MoodMenu/MenuItemCard';
import { TableZoneSelector } from './components/TablePersonality/TableZoneSelector';
import { FloorPlanMap } from './components/TablePersonality/FloorPlanMap';
import { CartDrawer } from './components/SmartOrder/CartDrawer';
import { TicketModal } from './components/SmartOrder/TicketModal';
import { QueueTracker } from './components/VirtualQueue/QueueTracker';
import { QueueNotification } from './components/VirtualQueue/QueueNotification';
import { KdsHeader } from './components/StaffKDS/KdsHeader';
import { StationFilter } from './components/StaffKDS/StationFilter';
import { OrderTicketCard } from './components/StaffKDS/OrderTicketCard';
import { TableManager } from './components/StaffKDS/TableManager';
import { PreparationStation, TableZone } from './types';
import { Search, Filter, Sparkles, Coffee } from 'lucide-react';

export const App: React.FC = () => {
  const {
    viewRole,
    activeTab,
    menuItems,
    currentMood,
    orders,
    selectedTable,
    setSelectedTable,
  } = useCafe();

  // State for Customer View
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedZone, setSelectedZone] = useState<TableZone | 'All'>('All');

  // State for Staff KDS View
  const [kdsStation, setKdsStation] = useState<PreparationStation | 'All'>('All');

  // Categories extracted from menu
  const categories = useMemo(() => {
    const set = new Set<string>();
    menuItems.forEach(i => set.add(i.category));
    return ['All', ...Array.from(set)];
  }, [menuItems]);

  // Filtered and sorted menu: prioritizes items matching current mood!
  const filteredMenu = useMemo(() => {
    return menuItems
      .filter(item => {
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.japaneseName.includes(searchQuery) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        const aPrimary = a.primaryMood === currentMood ? 2 : a.moods.includes(currentMood) ? 1 : 0;
        const bPrimary = b.primaryMood === currentMood ? 2 : b.moods.includes(currentMood) ? 1 : 0;
        return bPrimary - aPrimary;
      });
  }, [menuItems, selectedCategory, searchQuery, currentMood]);

  // Active orders for KDS
  const activeKdsOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  }, [orders]);

  return (
    <div className="min-h-screen washi-pattern flex flex-col justify-between">
      {/* Top Navbar */}
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {/* CUSTOMER PERSPECTIVE */}
        {viewRole === 'customer' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 1. Mood Menu Tab */}
            {activeTab === 'menu' && (
              <div className="space-y-8">
                {/* Mood Selector Header Bar */}
                <MoodSelector />

                {/* Search & Category Filter Row */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sumi-400" />
                      <input
                        type="text"
                        placeholder="Search menu (e.g. Matcha, Shakerato, Sourdough, Pasta...)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-washi-50 border border-washi-200 text-xs focus:outline-none focus:border-sumi-900 shadow-2xs font-medium"
                      />
                    </div>

                    <div className="text-xs font-mono text-sumi-500 self-end sm:self-auto">
                      Showing <span className="font-bold text-sumi-900">{filteredMenu.length}</span> curated items
                    </div>
                  </div>

                  {/* Category Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3.5 py-1.5 rounded-full whitespace-nowrap transition-all ${
                          selectedCategory === cat
                            ? 'bg-sumi-900 text-washi-50 font-bold shadow-2xs'
                            : 'bg-washi-100 text-sumi-600 hover:bg-washi-200 border border-washi-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((item) => (
                    <MenuItemCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. Table Personality Tab */}
            {activeTab === 'tables' && (
              <div className="space-y-8">
                <TableZoneSelector
                  selectedZone={selectedZone}
                  onSelectZone={setSelectedZone}
                />

                <FloorPlanMap
                  selectedZone={selectedZone}
                  onSelectTable={(table) => setSelectedTable(table)}
                />
              </div>
            )}

            {/* 3. Virtual Queue Tab */}
            {activeTab === 'queue' && (
              <QueueTracker />
            )}

          </div>
        )}

        {/* STAFF KITCHEN DISPLAY (KDS) PERSPECTIVE */}
        {viewRole === 'staff' && (
          <div className="space-y-8 animate-fade-in">
            {/* KDS Header with Metrics */}
            <KdsHeader />

            {/* Station Filter Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono font-semibold uppercase text-sumi-500">
                  Select Kitchen Station (担当切替)
                </div>
                <div className="text-xs font-mono text-sumi-500">
                  Auto-sync active • {activeKdsOrders.length} ticket(s)
                </div>
              </div>

              <StationFilter
                selectedStation={kdsStation}
                onSelectStation={setKdsStation}
              />
            </div>

            {/* Active Tickets Grid */}
            <div className="space-y-3">
              <div className="font-serif font-bold text-sumi-900 text-base">
                Live Kitchen Tickets ({activeKdsOrders.length})
              </div>

              {activeKdsOrders.length === 0 ? (
                <div className="bg-washi-50 border border-washi-200 rounded-3xl p-8 text-center text-xs font-mono text-sumi-400">
                  No active orders in the queue. All stations clear!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeKdsOrders.map((order) => (
                    <OrderTicketCard
                      key={order.id}
                      order={order}
                      activeStation={kdsStation}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Floor Table Turnover Management */}
            <TableManager />
          </div>
        )}

      </main>

      {/* Slide-over Cart & Shōkenki Ticket Generator Drawer */}
      <CartDrawer />

      {/* Ticket Dispensed Modal */}
      <TicketModal />

      {/* Floating Ready Notification Alert */}
      <QueueNotification />

      {/* Japanese Zen Footer */}
      <footer className="mt-12 border-t border-washi-200 bg-washi-100/50 py-8 text-center text-xs text-sumi-500 font-sans">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="font-serif text-sumi-700 font-medium">
            日常の喧騒を離れ、一杯の珈琲で心を整える。
          </div>
          <div className="text-[11px] text-sumi-400 font-mono">
            Mood Café ムードカフェ • Japanese Minimalist Smart Café System • Cloud Run Ready
          </div>
        </div>
      </footer>
    </div>
  );
};
