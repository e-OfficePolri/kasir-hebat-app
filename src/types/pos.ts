export type ProductCategory = 
  | 'Makanan'
  | 'Minuman'
  | 'Sembako'
  | 'Snack'
  | 'Kebutuhan Rumah'
  | 'ATK'
  | 'Lainnya';

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: ProductCategory;
  costPrice: number;    // Harga Beli / HPP
  sellingPrice: number; // Harga Jual
  stock: number;        // Stok otomatis
  minStockAlert: number; // Peringatan stok menipis (default 5)
  unit: string;         // 'pcs', 'cup', 'porsi', 'kg', 'botol', 'bungkus'
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountNominal: number; // Diskon per item
  subtotal: number;
}

export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'debit' | 'ewallet';
export type EWalletProvider = 'GoPay' | 'OVO' | 'DANA' | 'ShopeePay' | 'LinkAja' | 'BCA QRIS';
export type TransactionStatus = 'completed' | 'refunded';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  costPrice: number;
  unitPrice: number;
  quantity: number;
  discountNominal: number;
  subtotal: number;
  unit: string;
}

export interface Transaction {
  id: string;
  timestamp: string; // ISO string
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  totalCostPrice: number; // Total HPP untuk hitung laba kotor
  grossProfit: number;    // total - totalCostPrice
  paymentMethod: PaymentMethod;
  ewalletProvider?: EWalletProvider;
  amountPaid: number;
  change: number;
  cashierName: string;
  customerName: string;
  notes?: string;
  status: TransactionStatus;
  refundReason?: string;
  refundedAt?: string;
}

export type StockMovementType = 'sale' | 'restock' | 'adjustment' | 'refund';

export interface StockMovement {
  id: string;
  timestamp: string;
  productId: string;
  productName: string;
  sku: string;
  type: StockMovementType;
  quantityDelta: number; // Negatif jika penjualan, positif jika restok/refund
  previousStock: number;
  currentStock: number;
  note: string;
  referenceId?: string; // Transaction ID jika dari penjualan/refund
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  receiptFooter: string;
  activeCashierName: string;
  enableTax: boolean;
  taxPercent: number;
  paperSize: '58mm' | '80mm';
  showLogo: boolean;
  showAddress: boolean;
  showPhone: boolean;
  showCashier: boolean;
  showBarcode: boolean;
  enableSoundEffects: boolean;
  qrisNmid: string;
  qrisMerchantName: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  storeName: string;
  planId: 'monthly' | 'yearly';
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'active' | 'expired';
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  storeName: string;
  phone?: string;
  role: 'owner' | 'cashier';
  isDeveloper?: boolean;
  subscriptionStatus?: 'active' | 'pending' | 'expired';
  subscriptionPlan?: 'monthly' | 'yearly';
  subscriptionExpiresAt?: string;
}

export type TabType = 'home' | 'pos' | 'transactions' | 'inventory' | 'reports' | 'settings' | 'developer';
