// Developer & Subscription Configuration for Kasir Hebat
export const DEVELOPER_CONFIG = {
  // Developer email with lifetime unrestricted access
  developerEmail: 'irfannrmdnn@gmail.com',
  secondaryDeveloperEmail: 'irfan.setum@gmail.com',
  bankName: 'BCA (Bank Central Asia)',
  accountNumber: '0954277751',
  accountHolder: 'Irfan Ramadhan',
  // Official developer WhatsApp for automated proof of transfer confirmation
  whatsappNumber: '6281234567890', // Default clean format 62...
};

export interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  periodLabel: string;
  originalPrice: number;
  discountBadge?: string;
  popular?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Paket Bulanan (Retail Pro)',
    price: 35000,
    originalPrice: 50000,
    periodLabel: '/ bulan',
    discountBadge: 'Hemat 30%',
    features: [
      'Akses Penuh Kasir POS Kasir Hebat',
      'Manajemen Stok Barang & Barcode Scanner',
      'Database Cloud Firebase Realtime Sync',
      'Cetak Struk Thermal 58mm & 80mm',
      'Laporan Penjualan & Laba/Rugi Otomatis',
      'Dukungan Update Fitur Selama Aktif',
    ],
  },
  {
    id: 'yearly',
    name: 'Paket Tahunan (Paling Hemat)',
    price: 299000,
    originalPrice: 420000,
    periodLabel: '/ tahun (12 Bulan)',
    discountBadge: 'Hemat 50% (Paling Populer)',
    popular: true,
    features: [
      'Semua Fitur Paket Bulanan Lengkap',
      'Prioritas Sinkronisasi Cloud Firestore',
      'Dukungan Bantuan Teknis Prioritas via WA',
      'Bebas Biaya Perpanjangan Selama 1 Tahun Penuh',
      'Hemat Rp 121.000 dibanding bayar bulanan',
      'Jaminan Backup Otomatis Aman di Cloud',
    ],
  },
];
