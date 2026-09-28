import React, { useState } from 'react';
import {
  Github,
  X,
  Copy,
  Check,
  Terminal,
  FolderTree,
  Globe,
  ArrowUpRight,
  Zap,
  Smartphone,
  UploadCloud,
  FileCode,
} from 'lucide-react';

interface GithubGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GithubGuideModal: React.FC<GithubGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mobile' | 'vercel' | 'github' | 'structure'>('mobile');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const termuxCommands = `# 1. Update paket dan install Git di Termux
pkg update && pkg install git nodejs -y

# 2. Masuk ke folder proyek Anda di HP
cd /sdcard/Download/kasiran

# 3. Setup identitas Git Anda
git config --global user.name "Nama Anda"
git config --global user.email "email_anda@gmail.com"

# 4. Inisialisasi dan push ke GitHub
git init
git add .
git commit -m "feat: inisialisasi aplikasi kasiran"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/kasiran.git
git push -u origin main
# (Gunakan Personal Access Token/PAT sebagai password)`;

  const vercelCliCommands = `# 1. Pasang Vercel CLI secara global (jika belum terpasang)
npm install -g vercel

# 2. Login ke akun Vercel
vercel login

# 3. Deploy langsung ke Vercel
vercel

# 4. Untuk deploy ke production domain
vercel --prod`;

  const gitSteps = [
    {
      id: 'git-init',
      title: '1. Inisialisasi & Hubungkan ke Repositori GitHub',
      code: `# Di terminal folder proyek Anda:
git init
git add .
git commit -m "feat: inisialisasi aplikasi kasiran pos dan manajemen stok otomatis"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/kasiran.git
git push -u origin main`,
    },
    {
      id: 'git-dev',
      title: '2. Menjalankan Server Lokal (Local Dev)',
      code: `# Install dependencies
npm install

# Jalankan server development (port 3000)
npm run dev

# Membangun versi production (dist)
npm run build`,
    },
    {
      id: 'git-push',
      title: '3. Alur Kerja Commit & Push Setiap Ada Perubahan',
      code: `# Simpan semua perubahan
git add .
git commit -m "update: fitur baru atau penyesuaian stok"
git push origin main`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center text-white">
              <Smartphone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-100 text-sm">
                Panduan Push dari HP, GitHub &amp; Vercel
              </h3>
              <p className="text-xs text-neutral-400">
                Pilih metode yang paling mudah digunakan di smartphone Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 px-6 pt-3 pb-1 border-b border-neutral-800 bg-neutral-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'mobile'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cara Push dari HP</span>
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'vercel'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Hosting ke Vercel</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'github'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>Terminal Git Standar</span>
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'structure'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>Struktur Berkas</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto">
          {/* GitHub Repository Card */}
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <FileCode className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  Repositori Kode Kasir Hebat
                </h4>
                <p className="text-[11px] text-emerald-300/80 leading-normal">
                  Proyek ini dirancang mandiri tanpa dependensi tersembunyi, siap dibangun di Vercel secara otomatis.
                </p>
              </div>
            </div>
            <a
              href="https://github.com/e-OfficePolri/Kasiran-app"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 shrink-0"
            >
              <Github className="w-4 h-4" />
              <span>Buka Repositori GitHub</span>
            </a>
          </div>

          {/* TAB: PUSH DARI HP (MOBILE) */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              {/* Cara 1: Web GitHub Mobile */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4" /> Cara 1: Upload via Browser HP (Paling Praktis Tanpa Aplikasi)
                  </span>
                </div>
                <ol className="text-xs text-neutral-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Buka browser di HP (Chrome / Safari), buka <b>github.com</b> dan login.</li>
                  <li>Di menu browser HP (titik tiga kanan atas), aktifkan centang <b>&quot;Situs Desktop&quot;</b> (Desktop Site) agar tampilan penuh.</li>
                  <li>Buat repositori baru bernama <b>kasiran</b> (pilih Public).</li>
                  <li>Di halaman awal repo, klik link tulisan: <b className="text-emerald-300">uploading an existing file</b>.</li>
                  <li>Pilih file proyek dari galeri/penyimpanan HP Anda.</li>
                  <li>Klik tombol hijau <b>&quot;Commit changes&quot;</b>. Selesai!</li>
                </ol>
              </div>

              {/* Cara 2: Termux (Android) */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Cara 2: Via Termux (Terminal Resmi di Android)
                  </span>
                  <button
                    onClick={() => copyCode(termuxCommands, 'termux-cmd')}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                  >
                    {copiedIndex === 'termux-cmd' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Perintah Termux</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto select-text leading-relaxed">
                  {termuxCommands}
                </pre>
                <p className="text-[11px] text-neutral-400 leading-normal">
                  *Catatan: Saat memasukkan password di terminal HP, buat <b>Personal Access Token (PAT)</b> di GitHub: <i>Settings &rarr; Developer Settings &rarr; Personal access tokens &rarr; Generate new token</i> (centang izin &apos;repo&apos;).
                </p>
              </div>

              {/* Cara 3: Aplikasi Mobile Git GUI */}
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <span className="text-xs font-bold text-neutral-200 block">
                  Cara 3: Menggunakan Aplikasi Editor Code di HP (Ada Tombol Git Push Langsung)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div className="font-semibold text-emerald-300">Untuk Android: Spck Editor / Acode</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Download dari Play Store. Memiliki tab Git bawaan untuk Clone, Commit, dan Push ke GitHub hanya dengan menekan tombol.
                    </div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div className="font-semibold text-emerald-300">Untuk iPhone / iOS: Working Copy</div>
                    <div className="text-[11px] text-neutral-400 mt-1">
                      Aplikasi Git client terbaik di App Store untuk iPhone &amp; iPad. Terhubung langsung dengan akun GitHub Anda.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VERCEL HOSTING */}
          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Hubungkan GitHub ke Vercel (Bisa langsung dari browser HP!)
                  </span>
                  <a
                    href="https://vercel.com/new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1"
                  >
                    Buka Vercel <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                <ol className="text-xs text-neutral-300 space-y-2 list-decimal list-inside leading-relaxed">
                  <li>
                    Setelah kode ter-push ke GitHub, buka <a href="https://vercel.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-medium">vercel.com</a> di browser HP Anda.
                  </li>
                  <li>
                    Login dengan tombol <b>&quot;Continue with GitHub&quot;</b>.
                  </li>
                  <li>
                    Klik tombol <b>&quot;Add New...&quot;</b> &rarr; pilih <b>&quot;Project&quot;</b>.
                  </li>
                  <li>
                    Pilih repository <code className="text-emerald-300 bg-neutral-900 px-1 py-0.5 rounded">kasiran</code> Anda lalu klik <b>&quot;Import&quot;</b>.
                  </li>
                  <li>
                    Vercel otomatis mendeteksi Framework: <b className="text-white">Vite</b>. File konfigurasi <code className="text-emerald-300 font-mono">vercel.json</code> sudah kami sediakan.
                  </li>
                  <li>
                    Klik <b>&quot;Deploy&quot;</b>. Dalam ~30 detik aplikasi live di domain gratis seperti <code className="text-emerald-300 font-mono">https://kasiran-xxx.vercel.app</code>!
                  </li>
                </ol>
              </div>

              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" /> Deploy via Terminal (Vercel CLI)
                  </span>
                  <button
                    onClick={() => copyCode(vercelCliCommands, 'vercel-cli')}
                    className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                  >
                    {copiedIndex === 'vercel-cli' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Perintah</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-neutral-900 border border-neutral-800 rounded-lg font-mono text-[11px] text-emerald-300 overflow-x-auto select-text leading-relaxed">
                  {vercelCliCommands}
                </pre>
              </div>
            </div>
          )}

          {/* TAB: GITHUB STANDAR */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              {gitSteps.map(step => (
                <div key={step.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-200">
                    <span>{step.title}</span>
                    <button
                      onClick={() => copyCode(step.code, step.id)}
                      className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-emerald-400 transition-colors"
                    >
                      {copiedIndex === step.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Salin Perintah</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto select-text leading-relaxed">
                    {step.code}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* TAB: STRUKTUR BERKAS */}
          {activeTab === 'structure' && (
            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <FolderTree className="w-4 h-4" />
                <span>Struktur Berkas Kode Aplikasi Kasiran</span>
              </div>
              <div className="font-mono text-[11px] text-neutral-300 leading-relaxed space-y-1.5">
                <div>📄 <b className="text-white">vercel.json</b> - Konfigurasi deploy Vite + SPA rewrite ke index.html</div>
                <div>📁 <b className="text-white">src/types/pos.ts</b> - Definisi TypeScript Product, Cart, Transaction, StockMovement</div>
                <div>📁 <b className="text-white">src/context/PosContext.tsx</b> - Reducer state kasir, potong stok otomatis &amp; localStorage</div>
                <div>📁 <b className="text-white">src/components/PosView.tsx</b> - Layar kasir cepat, pencarian barang, scan barcode, keranjang</div>
                <div>📁 <b className="text-white">src/components/InventoryView.tsx</b> - Katalog stok barang, restok, audit log mutasi stok</div>
                <div>📁 <b className="text-white">src/components/TransactionsView.tsx</b> - Riwayat transaksi harian, filter tanggal, ekspor CSV</div>
                <div>📁 <b className="text-white">src/components/ReceiptModal.tsx</b> - Format struk thermal belanja 58/80mm siap cetak</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
