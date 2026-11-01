import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { CartItem, MenuItem, Mood, MoodMeta, Order, OrderStatus, PreparationStation, QueueEntry, StationMeta, Table, TableZoneMeta } from '../types';

interface CafeContextType {
  moods: MoodMeta[];
  zones: TableZoneMeta[];
  stations: StationMeta[];
  menuItems: MenuItem[];
  tables: Table[];
  orders: Order[];
  queue: QueueEntry[];
  currentMood: Mood;
  setCurrentMood: (mood: Mood) => void;
  activeTab: 'menu' | 'tables' | 'queue';
  setActiveTab: (tab: 'menu' | 'tables' | 'queue') => void;
  viewRole: 'customer' | 'staff';
  setViewRole: (role: 'customer' | 'staff') => void;
  selectedTable: Table | null;
  setSelectedTable: (table: Table | null) => void;
  cart: CartItem[];
  addToCart: (item: MenuItem, size?: 'R' | 'L', customization?: CartItem['customization']) => void;
  updateCartQuantity: (index: number, delta: number) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  latestOrder: Order | null;
  setLatestOrder: (order: Order | null) => void;
  isTicketModalOpen: boolean;
  setIsTicketModalOpen: (open: boolean) => void;
  submitOrder: (customerName: string, orderType: 'dine-in' | 'takeaway') => Promise<Order>;
  advanceOrderStatus: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  updateStationStatus: (orderId: string, station: PreparationStation, status: 'pending' | 'in_prep' | 'ready') => Promise<void>;
  toggleTableStatus: (tableId: string, status: Table['status']) => Promise<void>;
  resetAllData: () => Promise<void>;
  playChime: () => void;
  notification: string | null;
  clearNotification: () => void;
  isConnected: boolean;
}

const CafeContext = createContext<CafeContextType | undefined>(undefined);

export const CafeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [moods, setMoods] = useState<MoodMeta[]>([]);
  const [zones, setZones] = useState<TableZoneMeta[]>([]);
  const [stations, setStations] = useState<StationMeta[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  
  const [currentMood, setCurrentMood] = useState<Mood>('Focus');
  const [activeTab, setActiveTab] = useState<'menu' | 'tables' | 'queue'>('menu');
  const [viewRole, setViewRole] = useState<'customer' | 'staff'>('customer');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [latestOrder, setLatestOrder] = useState<Order | null>(() => {
    try {
      const saved = localStorage.getItem('mood_cafe_latest_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Harmonized Japanese Zen Bell chime using Web Audio API
  const playChime = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      // Dual resonant frequencies reminiscent of Japanese temple bell (Kansho / Rin)
      const freqs = [528, 792, 1056];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15 / (idx + 1), now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.9);
      });
    } catch (e) {
      console.warn('Audio chime playback omitted:', e);
    }
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      const [metaRes, menuRes, tablesRes, ordersRes, queueRes] = await Promise.all([
        fetch('/api/meta').then(r => r.json()),
        fetch('/api/menu').then(r => r.json()),
        fetch('/api/tables').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/queue').then(r => r.json()),
      ]);

      setMoods(metaRes.moods || []);
      setZones(metaRes.zones || []);
      setStations(metaRes.stations || []);
      setMenuItems(menuRes || []);
      setTables(tablesRes || []);
      setOrders(ordersRes || []);
      setQueue(queueRes || []);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  }, []);

  // Socket.IO real-time connection with automatic reconnection and fallback polling
  useEffect(() => {
    fetchData();

    const socket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('INIT_STATE', (payload) => {
      if (payload.tables) setTables(payload.tables);
      if (payload.orders) setOrders(payload.orders);
      if (payload.queue) setQueue(payload.queue);
    });

    socket.on('ORDER_CREATED', (payload: Order) => {
      setOrders(prev => [payload, ...prev.filter(o => o.id !== payload.id)]);
    });

    socket.on('ORDER_UPDATED', (payload: Order) => {
      setOrders(prev => prev.map(o => o.id === payload.id ? payload : o));
      // Notify customer if their order is ready
      setLatestOrder(current => {
        if (current && (current.id === payload.id || current.ticketNumber === payload.ticketNumber)) {
          if (payload.status === 'ready' && current.status !== 'ready') {
            playChime();
            setNotification(`🎉 Ticket ${payload.ticketNumber} is ready for pickup!`);
          }
          localStorage.setItem('mood_cafe_latest_order', JSON.stringify(payload));
          return payload;
        }
        return current;
      });
    });

    socket.on('TABLE_UPDATED', (payload: Table) => {
      if (payload && payload.id) {
        setTables(prev => prev.map(t => t.id === payload.id ? payload : t));
      }
    });

    socket.on('QUEUE_UPDATED', (payload: QueueEntry[]) => {
      setQueue(payload || []);
    });

    socket.on('RESET_DATA', (payload) => {
      if (payload.tables) setTables(payload.tables);
      if (payload.orders) setOrders(payload.orders);
      if (payload.queue) setQueue(payload.queue);
    });

    // Fallback periodic poll to ensure rock-solid state sync
    const pollInterval = setInterval(async () => {
      if (!isConnected) {
        try {
          const [tRes, oRes, qRes] = await Promise.all([
            fetch('/api/tables').then(r => r.json()),
            fetch('/api/orders').then(r => r.json()),
            fetch('/api/queue').then(r => r.json()),
          ]);
          setTables(tRes);
          setOrders(oRes);
          setQueue(qRes);
        } catch {
          // ignore
        }
      }
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      socket.disconnect();
    };
  }, [fetchData, isConnected, playChime]);

  // Sync latest order from orders array if available
  useEffect(() => {
    if (latestOrder) {
      const found = orders.find(o => o.id === latestOrder.id || o.ticketNumber === latestOrder.ticketNumber);
      if (found && JSON.stringify(found) !== JSON.stringify(latestOrder)) {
        setLatestOrder(found);
        localStorage.setItem('mood_cafe_latest_order', JSON.stringify(found));
      }
    }
  }, [orders, latestOrder]);

  // Cart operations
  const addToCart = (item: MenuItem, size: 'R' | 'L' = 'R', customization?: CartItem['customization']) => {
    const unitPrice = size === 'L' && item.priceLarge ? item.priceLarge : item.priceRegular;
    setCart(prev => {
      const existingIdx = prev.findIndex(ci =>
        ci.menuItem.id === item.id &&
        ci.size === size &&
        JSON.stringify(ci.customization || {}) === JSON.stringify(customization || {})
      );

      if (existingIdx >= 0) {
        const next = [...prev];
        next[existingIdx].quantity += 1;
        return next;
      }

      return [...prev, { menuItem: item, size, unitPrice, quantity: 1, customization }];
    });
  };

  const updateCartQuantity = (index: number, delta: number) => {
    setCart(prev => {
      const next = [...prev];
      const newQty = next[index].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== index);
      }
      next[index].quantity = newQty;
      return next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Shōkenki Order with Simulated Payment
  const submitOrder = async (customerName: string, orderType: 'dine-in' | 'takeaway'): Promise<Order> => {
    if (cart.length === 0) throw new Error('Cart is empty');

    const payload = {
      customerName: customerName.trim() || 'Café Guest',
      orderType,
      tableId: orderType === 'dine-in' && selectedTable ? selectedTable.id : undefined,
      tableZone: orderType === 'dine-in' && selectedTable ? selectedTable.zone : undefined,
      mood: currentMood,
      items: cart.map(ci => ({
        menuItemId: ci.menuItem.id,
        size: ci.size,
        quantity: ci.quantity,
        customization: ci.customization,
      })),
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to place order');
    }

    const newOrder: Order = await res.json();

    // Simulated payment step
    try {
      await fetch(`/api/orders/${newOrder.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'digital_ticket_shokenki' }),
      });
    } catch (e) {
      console.warn('Simulated payment note:', e);
    }

    setLatestOrder(newOrder);
    localStorage.setItem('mood_cafe_latest_order', JSON.stringify(newOrder));
    clearCart();
    setIsCartOpen(false);
    setIsTicketModalOpen(true);
    playChime();
    return newOrder;
  };

  // Staff KDS actions
  const advanceOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    const updated = await res.json();
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const updateStationStatus = async (orderId: string, station: PreparationStation, status: 'pending' | 'in_prep' | 'ready') => {
    const res = await fetch(`/api/orders/${orderId}/station`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ station, status }),
    });
    if (!res.ok) throw new Error('Failed to update station status');
    const updated = await res.json();
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  const toggleTableStatus = async (tableId: string, status: Table['status']) => {
    const res = await fetch(`/api/tables/${tableId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update table status');
    const updated = await res.json();
    setTables(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const resetAllData = async () => {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (res.ok) {
      await fetchData();
      setLatestOrder(null);
      localStorage.removeItem('mood_cafe_latest_order');
    }
  };

  const clearNotification = () => setNotification(null);

  return (
    <CafeContext.Provider
      value={{
        moods,
        zones,
        stations,
        menuItems,
        tables,
        orders,
        queue,
        currentMood,
        setCurrentMood,
        activeTab,
        setActiveTab,
        viewRole,
        setViewRole,
        selectedTable,
        setSelectedTable,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        latestOrder,
        setLatestOrder,
        isTicketModalOpen,
        setIsTicketModalOpen,
        submitOrder,
        advanceOrderStatus,
        updateStationStatus,
        toggleTableStatus,
        resetAllData,
        playChime,
        notification,
        clearNotification,
        isConnected,
      }}
    >
      {children}
    </CafeContext.Provider>
  );
};

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};
