import React, { useState, useRef } from 'react';
import { usePos } from '../context/PosContext';
import { StoreSettings } from '../types/pos';
import {
  Store,
  User,
  Percent,
  Database,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Github,
  Save,
  Cloud,
} from 'lucide-react';

interface SettingsViewProps {
  onOpenGithubGuide: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onOpenGithubGuide }) => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    exportDatabaseJson,
    importDatabaseJson,
    isCloudConnected,
    isSyncing,
  } = usePos();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const res = importDatabaseJson(content);
      if (res.success) {
        setImportStatus({ type: 'success', message: res.message });
      } else {
        setImportStatus({ type: 'error', message: res.message });
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetConfirm = () => {
    if (
      confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke data contoh bawaan? Semua transaksi dan barang baru akan ditimpa.'
      )
    ) {
      resetToSampleData();
      setFormData({ ...settings });
      alert('Data berhasil direset ke data sampel bawaan!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Pengaturan Toko &amp; Manajemen Data
        </h2>
        <p className="text-xs text-neutral-400">
          Kelola profil toko, identitas kasir, pencadangan database, dan integrasi GitHub.
        </p>
      </div>

      {/* Vercel & GitHub Callout Banner */}
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
            <Github className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              Siap Hosting Langsung ke Vercel &amp; GitHub
            </h4>
            <p className="text-xs text-neutral-400">
              Konfigurasi <code className="text-emerald-400 font-mono">vercel.json</code> sudah siap. Hubungkan repositori GitHub Anda ke Vercel untuk deployment otomatis gratis.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenGithubGuide}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shadow-sm"
        >
          Lihat Panduan Hosting Vercel
        </button>
      </div>

      {/* Form Store Settings */}
      <form onSubmit={handleSubmit} className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
          <Store className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-sm text-neutral-100">Informasi Profil Toko</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Nama Toko / Usaha
            </label>
            <input
              type="text"
              required
              value={formData.storeName}
              onChange={e => setFormData({ ...formData, storeName: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1">
              Nomor Telepon / WhatsApp
            </label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            Alamat Toko (Dicetak di Bagian Atas Struk)
          </label>
          <input
            type="text"
            required
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-neutral-300 block mb-1">
            Pesan Kaki Struk (Footer Struk)
          </label>
          <textarea
            rows={2}
            value={formData.receiptFooter}
            onChange={e => setFormData({ ...formData, receiptFooter: e.target.value })}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              <span>Nama Kasir Bertugas Saat Ini</span>
            </label>
            <input
              type="text"
              value={formData.activeCashierName}
              onChange={e => setFormData({ ...formData, activeCashierName: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-1 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-neutral-400" />
              <span>Tarif Pajak PPN Standar (%)</span>
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.taxPercent}
              onChange={e =>
                setFormData({ ...formData, taxPercent: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Thermal Receipt & Printer Customization */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Kustomisasi Cetak Struk Thermal
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Ukuran Kertas Thermal Printer Default
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paperSize: '58mm' })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    formData.paperSize === '58mm'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  58mm (Mini Portable)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paperSize: '80mm' })}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    formData.paperSize === '80mm'
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                  }`}
                >
                  80mm (Standar POS)
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Elemen yang Tampil di Struk
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs text-neutral-300">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showAddress}
                    onChange={e => setFormData({ ...formData, showAddress: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Alamat Toko</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPhone}
                    onChange={e => setFormData({ ...formData, showPhone: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>No. Telp Toko</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showCashier}
                    onChange={e => setFormData({ ...formData, showCashier: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Nama Kasir</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showBarcode}
                    onChange={e => setFormData({ ...formData, showBarcode: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Barcode Struk</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* QRIS & Merchant Settings */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Pengaturan QRIS Merchant
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                NMID QRIS Toko (Nomor Merchant ID)
              </label>
              <input
                type="text"
                value={formData.qrisNmid}
                onChange={e => setFormData({ ...formData, qrisNmid: e.target.value })}
                placeholder="ID1020038891234"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300 block mb-1">
                Nama Merchant pada QRIS
              </label>
              <input
                type="text"
                value={formData.qrisMerchantName}
                onChange={e => setFormData({ ...formData, qrisMerchantName: e.target.value })}
                placeholder="KASIR HEBAT STORE"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Sound Effects & Audio */}
        <div className="pt-4 border-t border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Efek Suara Kasir (Audio Beep)
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-200">
                <input
                  type="checkbox"
                  checked={formData.enableSoundEffects}
                  onChange={e =>
                    setFormData({ ...formData, enableSoundEffects: e.target.checked })
                  }
                  className="accent-emerald-500"
                />
                <span>Aktifkan Suara Scanner Barcode &amp; Checkout Selesai</span>
              </label>
              <p className="text-[11px] text-neutral-500 mt-0.5">
                Bunyi &apos;beep&apos; instan saat barang di-scan atau ditambah ke keranjang.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {saveSuccess ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-4 h-4" />
              <span>Pengaturan berhasil disimpan!</span>
            </div>
          ) : (
            <div />
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>

      {/* Data Backup & Restore Section */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-neutral-100">
              Database Cloud (Firebase Firestore) &amp; Sinkronisasi
            </h3>
          </div>
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              isCloudConnected
                ? 'bg-emerald-950/80 border-emerald-800/80 text-emerald-300'
                : 'bg-amber-950/80 border-amber-800/80 text-amber-300'
            }`}
          >
            {isCloudConnected ? '● Cloud Online & Terhubung' : '○ Mode Offline (Local Cache)'}
          </span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Sistem telah terhubung dengan <strong>Firebase Firestore Cloud</strong>. Setiap transaksi, perubahan harga, dan stok otomatis tersimpan di cloud secara aman dan dicadangkan ganda di browser Anda.
        </p>

        {importStatus && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs ${
              importStatus.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-800 text-rose-300'
            }`}
          >
            {importStatus.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDatabaseJson}
            className="flex items-center justify-center gap-2 p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Unduh Cadangan JSON</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-medium text-neutral-200 transition-colors"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Pulihkan dari File JSON</span>
            </button>
          </div>

          {/* Reset to Sample Data */}
          <button
            type="button"
            onClick={handleResetConfirm}
            className="flex items-center justify-center gap-2 p-3 bg-neutral-950 hover:bg-rose-950/40 border border-neutral-800 hover:border-rose-900 rounded-xl text-xs font-medium text-rose-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-rose-400" />
            <span>Reset ke Sampel Awal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
