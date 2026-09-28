import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  Sparkles,
  Zap,
  Camera,
  QrCode,
  Printer,
  Boxes,
  TrendingUp,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  LogIn,
  UserPlus,
  Play,
  Share2,
  Volume2,
  Lock,
  Layers,
  Award,
  ChevronRight,
  Database,
  BarChart,
  HeartHandshake,
} from 'lucide-react';

interface HomeViewProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onOpenLogin, onOpenRegister }) => {
  const { setActiveTab, settings, products, currentUser } = usePos();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleProtectedAction = (targetTab: 'pos' | 'inventory' | 'transactions' | 'reports' | 'settings') => {
    if (!currentUser) {
      onOpenLogin();
    } else {
      setActiveTab(targetTab);
    }
  };

  const features = [
    {
      icon: <Camera className="w-6 h-6 text-emerald-400" />,
      badge: 'Teknologi Canggih',
      title: 'Scan Barcode Kamera HP & Laptop',
      description:
        'Cukup arahkan kamera smartphone atau webcam laptop ke barcode kemasan barang (EAN-13, QR Code, Code-128). Otomatis masuk ke keranjang kasir dalam hitungan detik!',
      actionLabel: currentUser ? 'Coba Kasir Sekarang' : 'Masuk untuk Gunakan Fitur',
      actionTab: 'pos' as const,
      color: 'from-emerald-500/20 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
    },
    {
      icon: <QrCode className="w-6 h-6 text-teal-400" />,
      badge: 'Transaksi Digital',
      title: 'QRIS Dinamis & Beragam E-Wallet',
      description:
        'Generate kode QRIS otomatis sesuai total nominal belanja, terintegrasi pembayaran digital DANA, GoPay, OVO, ShopeePay, LinkAja, hingga transfer rekening bank.',
      actionLabel: currentUser ? 'Buka Menu POS' : 'Masuk untuk Gunakan Fitur',
      actionTab: 'pos' as const,
      color: 'from-teal-500/20 to-cyan-500/5',
      borderColor: 'border-teal-500/30',
    },
    {
      icon: <Printer className="w-6 h-6 text-amber-400" />,
      badge: 'Thermal Bluetooth',
      title: 'Cetak Struk Thermal 58mm & 80mm',
      description:
        'Mendukung printer thermal bluetooth kasir portable 58mm dan printer kasir 80mm standar. Dilengkapi kustomisasi logo toko, barcode struk, dan tombol kirim struk ke WhatsApp.',
      actionLabel: currentUser ? 'Atur Struk Toko' : 'Masuk untuk Atur Struk',
      actionTab: 'settings' as const,
      color: 'from-amber-500/20 to-orange-500/5',
      borderColor: 'border-amber-500/30',
    },
    {
      icon: <Boxes className="w-6 h-6 text-blue-400" />,
      badge: 'Audit Real-Time',
      title: 'Manajemen Stok & Riwayat Masuk-Keluar',
      description:
        'Stok terpotong otomatis saat transaksi berhasil, peringatan dini saat stok menipis, audit mutasi barang (restok, penyesuaian, penjualan), dan riwayat lengkap tanpa pusing.',
      actionLabel: currentUser ? 'Cek Stok Barang' : 'Masuk untuk Kelola Stok',
      actionTab: 'inventory' as const,
      color: 'from-blue-500/20 to-indigo-500/5',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      badge: 'Analisis Finansial',
      title: 'Laporan Omzet & Laba Bersih Otomatis',
      description:
        'Pantau grafik omzet penjualan harian, laba kotor, HPP (Harga Pokok Penjualan), produk paling laris (Top Selling), dan analisis metode pembayaran pelanggan secara visual.',
      actionLabel: currentUser ? 'Lihat Analisis Laporan' : 'Masuk untuk Buka Laporan',
      actionTab: 'reports' as const,
      color: 'from-purple-500/20 to-pink-500/5',
      borderColor: 'border-purple-500/30',
    },
    {
      icon: <Volume2 className="w-6 h-6 text-rose-400" />,
      badge: 'Pengalaman Nyata',
      title: 'Efek Suara Audio Kasir & Offline 100%',
      description:
        'Dilengkapi suara beep autentik saat scan barcode dan melodi kemenangan saat checkout lunas. Bekerja 100% tanpa internet tanpa takut koneksi putus.',
      actionLabel: currentUser ? 'Coba Suara Kasir' : 'Masuk untuk Akses POS',
      actionTab: 'settings' as const,
      color: 'from-rose-500/20 to-red-500/5',
      borderColor: 'border-rose-500/30',
    },
  ];

  const highlights = [
    { number: '100%', label: 'Gratis & Tanpa Biaya Langganan' },
    { number: '0.1s', label: 'Kecepatan Proses Barcode Instan' },
    { number: '58 & 80', label: 'Format Printer Thermal Didukung' },
    { number: 'Offline', label: 'Bisa Beroperasi Tanpa Koneksi Internet' },
  ];

  const faqs = [
    {
      q: 'Apakah Kasir Hebat bisa digunakan langsung di HP / Tablet?',
      a: 'Bisa! Kasir Hebat dirancang responsif, ringan, dan ramah sentuhan. Anda bisa mengaksesnya lewat browser HP, melakukan scan produk via kamera HP, dan mencetak struk lewat printer thermal bluetooth.',
    },
    {
      q: 'Apakah data barang dan transaksi saya aman jika browser ditutup?',
      a: 'Sangat aman! Seluruh data produk, riwayat transaksi, dan catatan stok tersimpan rapi di penyimpanan lokal (Local Storage) perangkat Anda dan dapat di-ekspor ke berkas JSON sebagai backup kapan saja.',
    },
    {
      q: 'Bagaimana cara scan barcode kemasan tanpa alat scanner eksternal?',
      a: 'Cukup klik tombol "Scan Kamera HP" di halaman Kasir POS. Arahkan kamera HP ke barcode kemasan barang, dan sistem akan langsung mengenali produknya secara otomatis.',
    },
    {
      q: 'Apakah saya bisa mengirim struk belanja ke WhatsApp pelanggan?',
      a: 'Tentu saja! Setelah pembayaran selesai, klik tombol "Kirim WhatsApp" pada tampilan struk. Masukkan nomor WhatsApp pembeli atau bagikan langsung dalam format teks rapi.',
    },
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-300 pb-12">
      {/* HERO BANNER SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-neutral-800 py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[320px] bg-emerald-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-10 w-72 h-72 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Top Pill / Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Aplikasi Kasir Pintar Generasi Baru UMKM &amp; Toko Retail</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Kelola Penjualan, Stok, &amp; Transaksi Toko Anda dengan{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Kasir Hebat
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Solusi kasir (Point of Sale) modern, cepat, dan lengkap: Scan barcode lewat kamera HP, pembayaran QRIS dinamis, cetak struk thermal, dan manajemen inventori otomatis tanpa ribet.
          </p>

          {/* Call to Actions Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setActiveTab('pos')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all active:scale-95 group"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>Buka Mesin Kasir Sekarang</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-500/25 transition-all active:scale-95 group"
                >
                  <LogIn className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                  <span>Masuk untuk Mulai Kasir</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-neutral-900/90 hover:bg-neutral-800 text-white font-semibold text-sm sm:text-base rounded-2xl border border-neutral-700 transition-all shadow-md active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  <span>Daftar Akun Toko Baru</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Trust Highlights */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-sm"
              >
                <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  {item.number}
                </div>
                <div className="text-xs text-neutral-400 font-medium mt-1 leading-snug">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO IKLAN FITUR-FITUR UNGGULAN (FEATURES GRID) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Fitur Lengkap Kasir Hebat
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Semua yang Dibutuhkan Kasir Modern Ada di Sini
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Didesain khusus untuk mempermudah operasional kasir harian, minimarket, warung kelontong, butik, kedai kopi, dan bisnis retail.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-6 bg-gradient-to-b ${feature.color} border ${feature.borderColor} relative flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200 shadow-lg`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 shadow-md">
                    {feature.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-neutral-900/90 text-neutral-300 border border-neutral-700/80">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {feature.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-neutral-800/80">
                <button
                  type="button"
                  onClick={() => handleProtectedAction(feature.actionTab)}
                  className="w-full flex items-center justify-between text-xs font-bold text-emerald-400 hover:text-emerald-300 group transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    {!currentUser && <Lock className="w-3.5 h-3.5 text-neutral-400" />}
                    <span>{feature.actionLabel}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE KASIR HEBAT BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950/70 via-neutral-900 to-teal-950/60 border border-emerald-800/60 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
                Keunggulan Spesial
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                Dirancang Cepat, Ramah Pengguna, &amp; Siap Pakai Tanpa Instalasi Rumit
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Anda tidak perlu menyewa server mahal atau membeli perangkat kasir puluhan juta. Cukup buka di browser HP, tablet, atau laptop Anda, dan mulai layani pembeli dengan struk resmi.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Scan barcode langsung via kamera</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Struk format 58mm &amp; 80mm</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Kirim struk digital ke WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-neutral-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hitung laba bersih &amp; HPP otomatis</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('pos')}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-95"
                  >
                    Buka Kasir POS Sekarang
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-95"
                    >
                      Masuk ke Akun Kasir
                    </button>
                    <button
                      type="button"
                      onClick={onOpenRegister}
                      className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold text-xs sm:text-sm rounded-xl border border-neutral-700 transition-all active:scale-95"
                    >
                      Daftar Akun Toko Baru
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Visual preview card */}
            <div className="lg:col-span-5 bg-neutral-950 p-6 rounded-2xl border border-neutral-800/90 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-[11px] text-neutral-500 font-mono">
                  kasir-hebat.live
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs text-neutral-400">Aplikasi / Toko:</span>
                  <span className="text-xs font-bold text-white">
                    {currentUser ? currentUser.storeName : 'Kasir Hebat'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs text-neutral-400">Total Katalog Produk:</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {products.length} Produk Siap Jual
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-xs text-neutral-400">Status Akun:</span>
                  <span className="text-xs font-semibold text-teal-300">
                    {currentUser ? `${currentUser.name} (Aktif)` : 'Siap Digunakan (Belum Login)'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-center">
                <span className="text-[11px] text-emerald-300 font-medium">
                  Status Sistem: Online, Cepat &amp; Responsif
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-xl sm:text-3xl font-extrabold text-white">
            Pertanyaan yang Sering Diajukan
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Hal-hal yang sering ditanyakan seputar pengoperasian aplikasi Kasir Hebat
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-emerald-400 transition-transform ${
                      isOpen ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FOOTER CALL TO ACTION */}
      <section className="text-center py-8 border-t border-neutral-800 max-w-5xl mx-auto px-4">
        <p className="text-xs text-neutral-500">
          Kasir Hebat &copy; {new Date().getFullYear()} — Solusi Kasir Pintar &amp; Pembukuan Stok Otomatis untuk Seluruh Pelaku Usaha.
        </p>
      </section>
    </div>
  );
};
