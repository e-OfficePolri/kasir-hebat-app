import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { PaymentMethod, EWalletProvider, Transaction } from '../types/pos';
import { usePos } from '../context/PosContext';
import { formatRupiah } from '../utils/formatters';
import {
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
  X,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: Transaction) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { cartTotals, checkout, settings } = usePos();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [selectedEWallet, setSelectedEWallet] = useState<EWalletProvider>('DANA');
  const [customerName, setCustomerName] = useState<string>('Pelanggan Umum');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [customCashPaid, setCustomCashPaid] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('BCA');
  const [approvalCode, setApprovalCode] = useState<string>('');
  const [qrisPaidStatus, setQrisPaidStatus] = useState<boolean>(false);
  const [copiedBank, setCopiedBank] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [qrisDataUrl, setQrisDataUrl] = useState<string>('');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState<boolean>(false);

  const total = cartTotals.total;

  // Generate dynamic QRIS QR Code using `qrcode` library
  useEffect(() => {
    if (isOpen) {
      const qrisPayload = `00020101021226${settings.qrisNmid || 'ID1020038891234'}520454115303360540${total}5802ID59${(settings.storeName || 'KASIR HEBAT').replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 20)}6007JAKARTA`;
      QRCode.toDataURL(qrisPayload, {
        width: 260,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then(url => setQrisDataUrl(url))
        .catch(err => console.error('Error generating QRIS QR code', err));
    }
  }, [isOpen, total, settings.qrisNmid, settings.storeName]);

  if (!isOpen) return null;

  // Quick cash buttons
  const getQuickCashOptions = () => {
    const options = new Set<number>();
    options.add(total); // Uang pas

    const denominations = [10000, 20000, 50000, 100000, 200000, 500000];
    denominations.forEach(d => {
      if (d >= total) options.add(d);
    });

    const next10k = Math.ceil(total / 10000) * 10000;
    const next50k = Math.ceil(total / 50000) * 50000;
    options.add(next10k);
    options.add(next50k);

    return Array.from(options)
      .sort((a, b) => a - b)
      .slice(0, 6);
  };

  const parsedCash = customCashPaid === '' ? total : parseFloat(customCashPaid) || 0;
  const change = Math.max(0, parsedCash - total);
  const isCashInsufficient = method === 'cash' && parsedCash < total;

  const handleSelectQuickCash = (amount: number) => {
    setCustomCashPaid(amount.toString());
  };

  const handleSimulateInstantPayment = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setQrisPaidStatus(true);
      // Auto process checkout after simulated payment confirmation
      setTimeout(() => {
        executeCheckout(true);
      }, 700);
    }, 1200);
  };

  const executeCheckout = (isQrisConfirmed = false) => {
    setErrorMessage('');

    if (method === 'cash' && parsedCash < total) {
      setErrorMessage(`Uang tunai kurang ${formatRupiah(total - parsedCash)}`);
      return;
    }

    const amountPaid = method === 'cash' ? parsedCash : total;

    let transactionNotes = notes.trim();
    if (method === 'transfer') {
      transactionNotes = `Transfer ${selectedBank}${approvalCode ? ` (Ref: ${approvalCode})` : ''}: ${transactionNotes}`.trim();
    } else if (method === 'debit') {
      transactionNotes = `EDC Debit/Kredit${approvalCode ? ` (Auth: ${approvalCode})` : ''}: ${transactionNotes}`.trim();
    } else if (method === 'ewallet') {
      transactionNotes = `${selectedEWallet}${customerPhone ? ` (${customerPhone})` : ''}: ${transactionNotes}`.trim();
    } else if (method === 'qris' && isQrisConfirmed) {
      transactionNotes = `QRIS Dinamis (Verified): ${transactionNotes}`.trim();
    }

    const res = checkout({
      paymentMethod: method,
      ewalletProvider: method === 'ewallet' ? selectedEWallet : undefined,
      amountPaid,
      customerName: customerName.trim() || 'Pelanggan Umum',
      notes: transactionNotes || undefined,
    });

    if (res.success && res.transaction) {
      onSuccess(res.transaction);
    } else {
      setErrorMessage(res.message || 'Gagal memproses transaksi.');
    }
  };

  const bankAccounts = {
    BCA: { no: '829-1029-441', name: settings.storeName },
    Mandiri: { no: '137-00-1928-119', name: settings.storeName },
    BRI: { no: '0341-01-002891-50-2', name: settings.storeName },
    BNI: { no: '098-112-4451', name: settings.storeName },
  };

  const handleCopyRekening = async (no: string) => {
    try {
      await navigator.clipboard.writeText(no.replace(/-/g, ''));
      setCopiedBank(true);
      setTimeout(() => setCopiedBank(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div>
            <h3 className="font-bold text-neutral-100 text-base">Pembayaran Kasir Hebat</h3>
            <p className="text-xs text-neutral-400">Pilih metode pembayaran dan selesaikan transaksi</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Display */}
        <div className="bg-neutral-950 px-6 py-5 border-b border-neutral-800/80 text-center">
          <div className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">
            Total Tagihan Belanja
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono tabular-nums mt-1">
            {formatRupiah(total)}
          </div>
          <div className="text-xs text-neutral-500 mt-1">
            {cartTotals.itemCount} barang dalam keranjang belanja
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {/* Tunai */}
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'cash'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span>Tunai (Cash)</span>
              </button>

              {/* QRIS */}
              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'qris'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <QrCode className="w-5 h-5 mb-1" />
                <span>QRIS Dinamis</span>
              </button>

              {/* E-Wallet */}
              <button
                type="button"
                onClick={() => setMethod('ewallet')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'ewallet'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span>E-Wallet</span>
              </button>

              {/* Transfer / Debit */}
              <button
                type="button"
                onClick={() => setMethod('transfer')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                  method === 'transfer' || method === 'debit'
                    ? 'border-emerald-500 bg-emerald-950/50 text-emerald-300 shadow-sm'
                    : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span>Bank / Debit</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Inputs */}
          {/* 1. CASH INPUT */}
          {method === 'cash' && (
            <div className="space-y-4 bg-neutral-950/60 p-4 rounded-xl border border-neutral-800">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-2">
                  Pilihan Cepat Nominal Uang Diterima
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {getQuickCashOptions().map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleSelectQuickCash(amount)}
                      className={`px-2.5 py-2 text-xs font-mono rounded-lg border transition-colors ${
                        parsedCash === amount
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 font-semibold'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800'
                      }`}
                    >
                      {amount === total ? 'Uang Pas' : formatRupiah(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1.5">
                  Nominal Tunai Lainnya (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-neutral-400 font-mono">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={customCashPaid}
                    onChange={e => setCustomCashPaid(e.target.value)}
                    placeholder={total.toString()}
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Live Change calculation */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-sm">
                <span className="text-neutral-400 font-medium">
                  {isCashInsufficient ? 'Kekurangan Pembayaran:' : 'Kembalian:'}
                </span>
                <span
                  className={`font-mono font-bold text-base tabular-nums ${
                    isCashInsufficient ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {isCashInsufficient
                    ? `- ${formatRupiah(total - parsedCash)}`
                    : formatRupiah(change)}
                </span>
              </div>
            </div>
          )}

          {/* 2. QRIS DINAMIS */}
          {method === 'qris' && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 flex flex-col items-center text-center space-y-3">
              <div className="w-full max-w-[240px] bg-white p-3.5 rounded-xl text-neutral-900 flex flex-col items-center shadow-lg">
                <div className="flex items-center justify-between w-full border-b pb-1.5 text-xs font-black text-rose-600">
                  <span className="tracking-tight font-sans">QRIS</span>
                  <span className="text-[10px] font-mono text-neutral-600">
                    {settings.qrisNmid || 'NMID: ID1020038891234'}
                  </span>
                </div>

                {/* Scannable QR Code image */}
                {qrisDataUrl ? (
                  <img
                    src={qrisDataUrl}
                    alt="QRIS Barcode"
                    className="w-44 h-44 my-2 object-contain rounded"
                  />
                ) : (
                  <div className="w-44 h-44 my-2 bg-neutral-100 flex items-center justify-center animate-pulse">
                    <span className="text-xs text-neutral-500">Membuat QRIS...</span>
                  </div>
                )}

                <div className="text-[11px] font-bold text-neutral-800 uppercase tracking-wide">
                  {settings.qrisMerchantName || settings.storeName || 'KASIR HEBAT'}
                </div>
                <div className="text-xs font-mono font-extrabold text-emerald-700 mt-0.5">
                  {formatRupiah(total)}
                </div>
              </div>

              <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
                Pelanggan dapat scan QRIS ini menggunakan aplikasi GoPay, OVO, DANA, BCA, ShopeePay, atau Bank apa saja.
              </p>

              {/* Simulation button */}
              <button
                type="button"
                onClick={handleSimulateInstantPayment}
                disabled={isSimulatingPayment || qrisPaidStatus}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  qrisPaidStatus
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold active:scale-95 shadow-md'
                }`}
              >
                {isSimulatingPayment ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Mengecek Pembayaran Masuk...</span>
                  </>
                ) : qrisPaidStatus ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Pembayaran Terkonfirmasi Lunas</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulasi Scan &amp; Bayar Langsung</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* 3. E-WALLET */}
          {method === 'ewallet' && (
            <div className="space-y-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <label className="text-xs font-medium text-neutral-300 block">
                Pilih E-Wallet Pelanggan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['DANA', 'GoPay', 'OVO', 'ShopeePay', 'LinkAja', 'BCA QRIS'] as const).map(
                  wallet => (
                    <button
                      key={wallet}
                      type="button"
                      onClick={() => setSelectedEWallet(wallet)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                        selectedEWallet === wallet
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {wallet}
                    </button>
                  )
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Nomor HP / Akun {selectedEWallet} (Opsional)
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. TRANSFER BANK / DEBIT */}
          {method === 'transfer' && (
            <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <label className="text-xs font-medium text-neutral-300 block">
                Pilih Rekening Bank Toko / Mesin EDC
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['BCA', 'Mandiri', 'BRI', 'BNI'] as const).map(bank => (
                  <button
                    key={bank}
                    type="button"
                    onClick={() => setSelectedBank(bank)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg border transition-colors ${
                      selectedBank === bank
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {bank}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-neutral-900 rounded-lg border border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 font-medium">
                    No. Rekening {selectedBank} Toko:
                  </div>
                  <div className="font-mono text-sm font-bold text-white tracking-wider">
                    {bankAccounts[selectedBank as keyof typeof bankAccounts]?.no}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    a.n {bankAccounts[selectedBank as keyof typeof bankAccounts]?.name}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyRekening(
                      bankAccounts[selectedBank as keyof typeof bankAccounts]?.no
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg transition-colors shrink-0"
                >
                  {copiedBank ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Salin</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Nomor Referensi / Kode Approval EDC (Opsional)
                </label>
                <input
                  type="text"
                  value={approvalCode}
                  onChange={e => setApprovalCode(e.target.value)}
                  placeholder="Contoh: REF-881923"
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Customer Name & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-xs font-medium text-neutral-400 block mb-1">
                Nama Pelanggan
              </label>
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Pelanggan Umum"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400 block mb-1">
                Catatan Transaksi (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Pesanan meja 2 / bungkus"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={() => executeCheckout(false)}
            disabled={isCashInsufficient}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg active:scale-98"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              Selesaikan Pembayaran ({formatRupiah(total)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
