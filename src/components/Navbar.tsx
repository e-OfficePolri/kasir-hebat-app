import React from 'react';
import { usePos } from '../context/PosContext';
import { TabType } from '../types/pos';
import {
  Home,
  ShoppingCart,
  Boxes,
  ReceiptText,
  BarChart3,
  Settings,
  AlertTriangle,
  Github,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenGithubGuide: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenGithubGuide,
  onOpenLogin,
  onOpenRegister,
}) => {
  const {
    activeTab,
    setActiveTab,
    lowStockCount,
    settings,
    cart,
    currentUser,
    logoutUser,
    isCloudConnected,
    isSyncing,
  } = usePos();

  const allNavItems: { id: TabType; label: string; icon: React.ReactNode; badge?: number; authRequired?: boolean }[] = [
    {
      id: 'home',
      label: 'Beranda',
      icon: <Home className="w-4 h-4" />,
      authRequired: false,
    },
    {
      id: 'pos',
      label: 'Kasir POS',
      icon: <ShoppingCart className="w-4 h-4" />,
      badge: cart.length > 0 ? cart.reduce((s, i) => s + i.quantity, 0) : undefined,
      authRequired: true,
    },
    {
      id: 'inventory',
      label: 'Stok Barang',
      icon: <Boxes className="w-4 h-4" />,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      authRequired: true,
    },
    {
      id: 'transactions',
      label: 'Transaksi',
      icon: <ReceiptText className="w-4 h-4" />,
      authRequired: true,
    },
    {
      id: 'reports',
      label: 'Laporan',
      icon: <BarChart3 className="w-4 h-4" />,
      authRequired: true,
    },
    {
      id: 'settings',
      label: 'Pengaturan',
      icon: <Settings className="w-4 h-4" />,
      authRequired: true,
    },
  ];

  // If user is not logged in, hide navbar menu links completely.
  // Once logged in, show all POS, Stok, Transaksi, Laporan, Pengaturan menus!
  const visibleNavItems = currentUser ? allNavItems : [];

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/95 backdrop-blur border-b border-neutral-800 text-neutral-100 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark (clickable to go home) */}
        <button
          type="button"
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-3 shrink-0 text-left group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-extrabold text-neutral-950 shadow-md shadow-emerald-950/40 text-base group-hover:scale-105 transition-transform">
            KH
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white leading-tight">
              Kasir Hebat
            </span>
            <span className="text-[11px] text-neutral-400 leading-none truncate max-w-[130px] sm:max-w-[180px]">
              {currentUser ? currentUser.storeName : 'Aplikasi Kasir Toko & Retail'}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links (Only shown when logged in) */}
        {visibleNavItems.length > 0 && (
          <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1">
            {visibleNavItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 relative ${
                    isActive
                      ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-inner'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        item.id === 'inventory'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Zone 3: Actions, Auth Buttons (Masuk, Daftar, or User Profile & Logout) */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <>
              {lowStockCount > 0 && (
                <button
                  onClick={() => setActiveTab('inventory')}
                  title={`${lowStockCount} barang memiliki stok menipis/habis`}
                  className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-amber-950/60 text-amber-300 border border-amber-800/60 hover:bg-amber-900/60 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{lowStockCount} Stok Menipis</span>
                </button>
              )}

              {/* Cloud Sync Status Indicator */}
              <div
                title={
                  isSyncing
                    ? 'Menyinkronkan data dengan Firebase Cloud...'
                    : isCloudConnected
                    ? 'Terhubung dengan Firebase Cloud Database (Real-Time)'
                    : 'Mode Offline (Data tersimpan di perangkat lokal)'
                }
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px]"
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    isSyncing
                      ? 'bg-amber-400 animate-pulse'
                      : isCloudConnected
                      ? 'bg-emerald-400'
                      : 'bg-neutral-500'
                  }`}
                />
                <span className="text-neutral-400">
                  {isSyncing ? 'Sinkron...' : isCloudConnected ? 'Cloud Aktif' : 'Lokal'}
                </span>
              </div>

              {/* Logged-in User Profile Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 text-neutral-200 text-xs border border-neutral-700">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-white leading-tight truncate max-w-[90px] sm:max-w-[120px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-emerald-400 leading-none">
                    {currentUser.role === 'owner' ? 'Pemilik Toko' : 'Kasir Aktif'}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={logoutUser}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-300 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-900/60 rounded-xl transition-all"
                title="Keluar (Logout) Akun Kasir"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </>
          ) : (
            <>
              {/* TOMBOL MASUK (LOGIN) */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800/90 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-all shadow-sm active:scale-95"
                title="Masuk ke Akun Kasir"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                <span>Masuk</span>
              </button>

              {/* TOMBOL DAFTAR (REGISTER) */}
              <button
                type="button"
                onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                title="Daftar Akun Toko Baru"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar</span>
              </button>
            </>
          )}

          {/* Hosting & GitHub Guide Button */}
          <button
            onClick={onOpenGithubGuide}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl transition-colors"
            title="Panduan Hosting Vercel & GitHub"
          >
            <Github className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
