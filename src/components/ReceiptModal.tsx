import React, { useRef, useState } from 'react';
import { Transaction } from '../types/pos';
import { usePos } from '../context/PosContext';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import {
  Printer,
  Copy,
  Check,
  X,
  CheckCircle2,
  Share2,
  SlidersHorizontal,
  Smartphone,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, onClose }) => {
  const { settings } = usePos();
  const [copied, setCopied] = useState(false);
  const [paperWidth, setPaperWidth] = useState<'58mm' | '80mm'>(settings.paperSize || '58mm');
  const [showAddress, setShowAddress] = useState(settings.showAddress ?? true);
  const [showPhone, setShowPhone] = useState(settings.showPhone ?? true);
  const [showCashier, setShowCashier] = useState(settings.showCashier ?? true);
  const [showBarcode, setShowBarcode] = useState(settings.showBarcode ?? true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [waNumber, setWaNumber] = useState('');
  const [showWaPrompt, setShowWaPrompt] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptPlainText = (): string => {
    const divider = '------------------------------------------\n';
    let text = `*${settings.storeName.toUpperCase()}*\n`;
    if (showAddress) text += `${settings.address}\n`;
    if (showPhone) text += `Telp: ${settings.phone}\n`;
    text += divider;
    text += `No. Struk : ${transaction.id}\n`;
    text += `Waktu     : ${formatDateTime(transaction.timestamp)}\n`;
    if (showCashier) text += `Kasir     : ${transaction.cashierName}\n`;
    text += `Pelanggan : ${transaction.customerName}\n`;
    text += divider;

    transaction.items.forEach(item => {
      text += `${item.productName}\n`;
      text += `  ${item.quantity} ${item.unit} x ${formatRupiah(item.unitPrice)} = ${formatRupiah(item.subtotal)}\n`;
    });

    text += divider;
    text += `Subtotal  : ${formatRupiah(transaction.subtotal)}\n`;
    if (transaction.discount > 0) {
      text += `Diskon    : -${formatRupiah(transaction.discount)}\n`;
    }
    if (transaction.tax > 0) {
      text += `Pajak/PPN : ${formatRupiah(transaction.tax)}\n`;
    }
    text += `*TOTAL     : ${formatRupiah(transaction.total)}*\n`;
    text += divider;
    text += `Metode    : ${transaction.paymentMethod.toUpperCase()}${transaction.ewalletProvider ? ` (${transaction.ewalletProvider})` : ''}\n`;
    text += `Bayar     : ${formatRupiah(transaction.amountPaid)}\n`;
    text += `Kembali   : ${formatRupiah(transaction.change)}\n`;
    text += divider;
    text += `${settings.receiptFooter}\n`;
    return text;
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generateReceiptPlainText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to copy text', e);
    }
  };

  const handleSendWhatsApp = () => {
    const rawText = generateReceiptPlainText();
    const encodedText = encodeURIComponent(rawText);
    let url = `https://wa.me/?text=${encodedText}`;
    if (waNumber.trim()) {
      let cleanPhone = waNumber.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('0')) {
        cleanPhone = '62' + cleanPhone.slice(1);
      }
      url = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    }
    window.open(url, '_blank');
    setShowWaPrompt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* Header bar modal (hidden on paper print) */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70 no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-neutral-100 text-sm">
                Transaksi Sukses &amp; Cetak Struk
              </h3>
              <p className="text-[11px] text-neutral-400">Kasir Hebat — Printer Thermal 58mm / 80mm</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`p-1.5 rounded-xl border transition-colors ${
                showCustomizer
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
              title="Atur Kustomisasi Struk"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization panel (hidden during print) */}
        {showCustomizer && (
          <div className="p-4 bg-neutral-950/90 border-b border-neutral-800 text-xs space-y-3 no-print">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-200">Ukuran Kertas Thermal:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    paperWidth === '58mm'
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  58mm (Mini)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    paperWidth === '80mm'
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  80mm (Standar)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-800/80">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={showAddress}
                  onChange={e => setShowAddress(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Alamat Toko</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={showPhone}
                  onChange={e => setShowPhone(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Nomor Telp</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={showCashier}
                  onChange={e => setShowCashier(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Nama Kasir</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-neutral-300">
                <input
                  type="checkbox"
                  checked={showBarcode}
                  onChange={e => setShowBarcode(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                <span>Barcode Struk</span>
              </label>
            </div>
          </div>
        )}

        {/* WhatsApp Send Dialog Prompt */}
        {showWaPrompt && (
          <div className="p-4 bg-emerald-950/60 border-b border-emerald-800/60 text-xs space-y-2 no-print">
            <span className="font-semibold text-emerald-300 block">
              Kirim Struk Belanja ke WhatsApp Pelanggan:
            </span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-emerald-500" />
                <input
                  type="tel"
                  placeholder="Nomor WA (contoh: 08123456789)"
                  value={waNumber}
                  onChange={e => setWaNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-emerald-700/80 rounded-xl text-white text-xs font-mono placeholder:text-neutral-500 focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-xl text-xs transition-all shadow-md shrink-0"
              >
                Kirim WA
              </button>
            </div>
          </div>
        )}

        {/* Receipt paper container */}
        <div className="p-4 sm:p-6 bg-neutral-950 flex justify-center max-h-[60vh] overflow-y-auto">
          <div
            ref={receiptRef}
            style={{ maxWidth: paperWidth === '58mm' ? '300px' : '380px' }}
            className="receipt-printable w-full bg-white text-neutral-900 font-mono text-[12px] p-5 shadow-xl border border-neutral-300 select-text transition-all rounded-sm"
          >
            {/* Store Branding */}
            <div className="text-center mb-3">
              <h2 className="text-base font-extrabold tracking-tight uppercase">
                {settings.storeName || 'KASIR HEBAT'}
              </h2>
              {showAddress && (
                <p className="text-[11px] text-neutral-600 mt-0.5 leading-snug">
                  {settings.address}
                </p>
              )}
              {showPhone && (
                <p className="text-[11px] text-neutral-600">Telp: {settings.phone}</p>
              )}
            </div>

            <div className="border-b border-dashed border-neutral-400 my-2.5" />

            {/* Transaction Metadata */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">No. Struk</span>
                <span className="font-semibold">{transaction.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Waktu</span>
                <span>{formatDateTime(transaction.timestamp)}</span>
              </div>
              {showCashier && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Kasir</span>
                  <span>{transaction.cashierName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-neutral-600">Pelanggan</span>
                <span>{transaction.customerName}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-neutral-400 my-2.5" />

            {/* Line Items */}
            <div className="space-y-2 py-1">
              {transaction.items.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-semibold text-neutral-900 leading-snug">
                    {item.productName}
                  </div>
                  <div className="flex justify-between text-[11px] text-neutral-700">
                    <span>
                      {item.quantity} {item.unit} x {formatRupiah(item.unitPrice)}
                    </span>
                    <span className="font-bold tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-b border-dashed border-neutral-400 my-2.5" />

            {/* Totals Breakdown */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="tabular-nums">{formatRupiah(transaction.subtotal)}</span>
              </div>
              {transaction.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Penjualan</span>
                  <span className="tabular-nums">-{formatRupiah(transaction.discount)}</span>
                </div>
              )}
              {transaction.tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-neutral-600">Pajak PPN</span>
                  <span className="tabular-nums">{formatRupiah(transaction.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold pt-1.5 border-t border-neutral-400">
                <span>TOTAL AKHIR</span>
                <span className="tabular-nums text-base">{formatRupiah(transaction.total)}</span>
              </div>
            </div>

            <div className="border-b border-dashed border-neutral-400 my-2.5" />

            {/* Payment Details */}
            <div className="space-y-0.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-600">Metode Bayar</span>
                <span className="font-bold uppercase tracking-wide">
                  {transaction.paymentMethod === 'cash'
                    ? 'TUNAI'
                    : transaction.paymentMethod === 'qris'
                    ? 'QRIS DINAMIS'
                    : transaction.paymentMethod === 'ewallet'
                    ? `E-WALLET ${transaction.ewalletProvider || ''}`
                    : 'TRANSFER BANK / DEBIT'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Jumlah Bayar</span>
                <span className="tabular-nums font-semibold">
                  {formatRupiah(transaction.amountPaid)}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Kembalian</span>
                <span className="tabular-nums text-emerald-800">
                  {formatRupiah(transaction.change)}
                </span>
              </div>
            </div>

            {/* Barcode Simulation */}
            {showBarcode && (
              <div className="my-3.5 flex flex-col items-center">
                <div className="h-8 w-44 flex items-end justify-between px-2 overflow-hidden bg-neutral-100 py-1">
                  {[12, 28, 16, 32, 20, 10, 24, 18, 30, 14, 26, 12, 32, 18, 22, 14, 28, 16, 20, 24].map(
                    (h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}px` }}
                        className={`w-[2px] bg-neutral-900 ${i % 3 === 0 ? 'w-[3px]' : ''}`}
                      />
                    )
                  )}
                </div>
                <span className="text-[9px] tracking-widest text-neutral-500 mt-1 font-mono">
                  *{transaction.id}*
                </span>
              </div>
            )}

            {/* Receipt Footer */}
            <div className="text-center text-[10px] text-neutral-600 leading-normal border-t border-dashed border-neutral-300 pt-2.5">
              <p>{settings.receiptFooter}</p>
              <p className="mt-1 font-semibold text-neutral-800">
                Simpan struk ini sebagai bukti transaksi resmi.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Controls */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Teks</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowWaPrompt(!showWaPrompt)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/60 rounded-xl transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kirim WhatsApp</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-colors shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Struk ({paperWidth})</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-colors"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
