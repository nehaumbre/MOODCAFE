export type Mood = 'Focus' | 'Comfort' | 'Energetic' | 'Refresh' | 'Indulgence';

export interface MoodMeta {
  id: Mood;
  kanji: string;
  romaji: string;
  english: string;
  subtitle: string;
  description: string;
  accentColor: string;
  badgeBg: string;
  textColor: string;
  sensoryNotes: string[];
}

export type PreparationStation = 'Espresso' | 'MatchaTea' | 'HotKitchen' | 'ColdPrep';

export interface StationMeta {
  id: PreparationStation;
  name: string;
  japaneseName: string;
  iconName: string;
  description: string;
}

export type TableZone = 'Focus' | 'Social' | 'Window' | 'QuickBite';

export interface TableZoneMeta {
  id: TableZone;
  name: string;
  japaneseName: string;
  vibe: string;
  description: string;
  icon: string;
  amenities: string[];
}

export interface Table {
  id: string;
  zone: TableZone;
  name: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  features: string[];
  currentOrderNumber?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  japaneseName: string;
  category: string;
  description: string;
  priceRegular: number;
  priceLarge?: number;
  calories?: string;
  preparationStation: PreparationStation;
  basePrepMinutes: number;
  primaryMood: Mood;
  moods: Mood[];
  tags: string[];
  isVeg: boolean;
  isNew?: boolean;
  temperatureOptions?: ('Hot' | 'Iced')[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  japaneseName: string;
  size: 'R' | 'L';
  unitPrice: number;
  quantity: number;
  preparationStation: PreparationStation;
  customization?: {
    temperature?: 'Hot' | 'Iced';
    milk?: 'Oat Milk' | 'Almond Milk' | 'Full Cream' | 'Soy Milk';
    sweetness?: '0%' | '25%' | '50%' | '100%';
    iceLevel?: 'Less Ice' | 'Normal' | 'No Ice';
    specialNote?: string;
  };
  itemStatus: 'pending' | 'in_prep' | 'ready';
}

export type OrderStatus = 'received' | 'preparing' | 'plating' | 'ready' | 'completed' | 'cancelled';

export interface StationProgress {
  station: PreparationStation;
  stationName: string;
  status: 'pending' | 'in_prep' | 'ready';
  itemCount: number;
}

export interface Order {
  id: string;
  ticketNumber: string; // e.g. "№ A-101"
  customerName: string;
  orderType: 'dine-in' | 'takeaway';
  tableId?: string;
  tableZone?: TableZone;
  mood: Mood;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  estimatedMinutes: number;
  estimatedReadyAt: string;
  createdAt: string;
  updatedAt: string;
  stationProgress: StationProgress[];
  queuePosition: number;
  isReadyNotificationSent?: boolean;
}

export interface QueueEntry {
  ticketNumber: string;
  orderId: string;
  customerName: string;
  queuePosition: number;
  status: OrderStatus;
  estimatedMinutes: number;
  orderType: 'dine-in' | 'takeaway';
  tableId?: string;
  mood: Mood;
  itemCount: number;
  createdAt: string;
}
