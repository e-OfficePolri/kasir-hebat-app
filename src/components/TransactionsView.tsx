import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Transaction, PaymentMethod } from '../types/pos';
import {
  formatRupiah,
  formatDateTime,
  exportToCSV,
} from '../utils/formatters';
import {
  Search,
  Download,
  Receipt,
  RotateCcw,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react';

interface TransactionsViewProps {
  onReprintReceipt: (transaction: Transaction) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onReprintReceipt }) => {
  const { transactions, refundTransaction } = usePos();

  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refundTarget, setRefundTarget] = useState<Transaction | null>(null);
  const [refundReason, setRefundReason] = useState<string>('Pelanggan salah pesan / retur barang');
  const [selectedTransactionDetail, setSelectedTransactionDetail] = useState<Transaction | null>(null);

  // Filter transactions based on date, method, search
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
    const weekStart = todayStart - 7 * 24 * 60 * 60 * 1000;
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return transactions.filter(trx => {
      const trxTime = new Date(trx.timestamp).getTime();

      // Date filter
      if (dateFilter === 'today' && trxTime < todayStart) return false;
      if (dateFilter === 'yesterday' && (trxTime < yesterdayStart || trxTime >= todayStart)) return false;
      if (dateFilter === 'week' && trxTime < weekStart) return false;
      if (dateFilter === 'month' && trxTime < monthStart) return false;

      // Method filter
      if (methodFilter !== 'all' && trx.paymentMethod !== methodFilter) return false;

      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesId = trx.id.toLowerCase().includes(q);
        const matchesCustomer = trx.customerName.toLowerCase().includes(q);
        const matchesItems = trx.items.some(i => i.productName.toLowerCase().includes(q));
        if (!matchesId && !matchesCustomer && !matchesItems) return false;
      }

      return true;
    });
  }, [transactions, dateFilter, methodFilter, searchQuery]);

  // Financial KPIs for the filtered transactions
  const activeTransactions = filteredTransactions.filter(t => t.status === 'completed');
  const totalRevenue = activeTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalProfit = activeTransactions.reduce((acc, t) => acc + (t.grossProfit || 0), 0);
  const averageTicket = activeTransactions.length > 0 ? Math.round(totalRevenue / activeTransactions.length) : 0;

  const handleConfirmRefund = () => {
    if (!refundTarget) return;
    refundTransaction(refundTarget.id, refundReason);
    setRefundTarget(null);
  };

  const handleExportCSV = () => {
    const exportRows = filteredTransactions.map(t => ({
      'ID Transaksi': t.id,
      'Waktu': formatDateTime(t.timestamp),
      'Pelanggan': t.customerName,
      'Kasir': t.cashierName,
      'Jumlah Item': t.items.reduce((s, i) => s + i.quantity, 0),
      'Subtotal': t.subtotal,
      'Diskon': t.discount,
      'Pajak PPN': t.tax,
      'Total Akhir': t.total,
      'Estimasi Laba Kotor': t.grossProfit,
      'Metode Bayar': t.paymentMethod.toUpperCase(),
      'Status': t.status === 'completed' ? 'Selesai' : 'Dibatalkan (Refund)',
      'Alasan Refund': t.refundReason || '-',
    }));

    exportToCSV(`laporan-transaksi-kasiran-${dateFilter}`, exportRows);
  };

  const getMethodIcon = (m: PaymentMethod) => {
    switch (m) {
      case 'cash':
        return <Banknote className="w-3.5 h-3.5 text-emerald-400" />;
      case 'qris':
        return <QrCode className="w-3.5 h-3.5 text-cyan-400" />;
      case 'transfer':
        return <CreditCard className="w-3.5 h-3.5 text-violet-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Total Penjualan</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-neutral-500">
            {activeTransactions.length} transaksi selesai
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Estimasi Laba Kotor</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {formatRupiah(totalProfit)}
          </div>
          <div className="text-[11px] text-neutral-500">
            Margin ~{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}% dari omzet
          </div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Rata-rata Nilai Belanja (AOV)</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {formatRupiah(averageTicket)}
          </div>
          <div className="text-[11px] text-neutral-500">Per transaksi pelanggan</div>
        </div>

        <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-1">
          <div className="text-xs text-neutral-400 font-medium">Total Transaksi Masuk</div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
            {filteredTransactions.length}
          </div>
          <div className="text-[11px] text-neutral-500">
            {filteredTransactions.filter(t => t.status === 'refunded').length} dibatalkan / refund
          </div>
        </div>
      </div>

      {/* Date & Search Filter Controls */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
        {/* Date Segmented Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            <span className="text-xs text-neutral-400 mr-1 hidden sm:inline flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Periode:
            </span>
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'week', label: '7 Hari Terakhir' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'all', label: 'Semua Transaksi' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDateFilter(tab.id as typeof dateFilter)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  dateFilter === tab.id
                    ? 'bg-neutral-100 text-neutral-900 shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-xl transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV / Excel</span>
          </button>
        </div>

        {/* Search & Method Row */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-neutral-800/80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari ID transaksi, nama pelanggan, atau nama produk..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={methodFilter}
              onChange={e => setMethodFilter(e.target.value)}
              className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Semua Metode Pembayaran</option>
              <option value="cash">Tunai (Cash)</option>
              <option value="qris">QRIS Dinamis</option>
              <option value="ewallet">E-Wallet (GoPay/DANA/OVO)</option>
              <option value="transfer">Transfer Bank</option>
              <option value="debit">Kartu Debit / EDC</option>
            </select>

            {(searchQuery || methodFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setMethodFilter('all');
                }}
                className="text-xs text-neutral-400 hover:text-white px-2 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[11px] font-semibold bg-neutral-950/60">
                <th className="py-3 px-4">ID Transaksi</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Item Terjual</th>
                <th className="py-3 px-4 text-right">Total Transaksi</th>
                <th className="py-3 px-4 text-center">Metode</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {filteredTransactions.map(trx => {
                const totalItemsCount = trx.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <tr
                    key={trx.id}
                    className="hover:bg-neutral-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">
                      {trx.id}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {formatDateTime(trx.timestamp)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-200 font-medium">
                      {trx.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      <div className="font-mono text-neutral-300">
                        {totalItemsCount} barang
                      </div>
                      <div className="text-[10px] text-neutral-400 truncate max-w-xs">
                        {trx.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-emerald-400 text-sm">
                      {formatRupiah(trx.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-950 text-neutral-300 border border-neutral-800">
                        {getMethodIcon(trx.paymentMethod)}
                        <span className="uppercase">{trx.paymentMethod}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {trx.status === 'completed' ? (
                        <span className="text-emerald-400 font-semibold text-[11px]">
                          Selesai
                        </span>
                      ) : (
                        <span className="text-rose-400 font-semibold text-[11px]" title={trx.refundReason}>
                          Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onReprintReceipt(trx)}
                          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                          title="Cetak Ulang Struk"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>

                        {trx.status === 'completed' && (
                          <button
                            onClick={() => {
                              setRefundTarget(trx);
                              setRefundReason('Pelanggan membatalkan pesanan / retur');
                            }}
                            className="p-1.5 text-neutral-500 hover:text-rose-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                            title="Batalkan Transaksi & Kembalikan Stok"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTransactions.length === 0 && (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <p className="text-sm font-medium">Belum ada transaksi pada periode ini</p>
              <p className="text-xs text-neutral-400">
                Pilih periode lain di atas atau lakukan transaksi baru di menu Kasir POS.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: REFUND / CANCEL TRANSACTION WITH AUTOMATIC STOCK RESTORE */}
      {refundTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-neutral-100 text-sm">
                  Batalkan Transaksi (Refund)
                </h3>
              </div>
              <button
                onClick={() => setRefundTarget(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-neutral-400">No. Transaksi</span>
                  <span className="font-mono font-semibold text-white">{refundTarget.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Belanja</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {formatRupiah(refundTarget.total)}
                  </span>
                </div>
              </div>

              {/* Automatic Stock Restoration Notice */}
              <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-rose-200">
                    Stok Barang Akan Dikembalikan Otomatis!
                  </div>
                  <div className="mt-0.5 text-rose-300/80 leading-normal">
                    Seluruh {refundTarget.items.length} item dalam transaksi ini akan ditambahkan kembali ke inventaris stok barang secara otomatis.
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Alasan Pembatalan / Refund
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRefundTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRefund}
                  className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
                >
                  Konfirmasi Batalkan &amp; Kembalikan Stok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
