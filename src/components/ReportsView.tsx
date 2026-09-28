import React, { useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { PaymentMethod } from '../types/pos';
import { formatRupiah } from '../utils/formatters';
import {
  TrendingUp,
  Award,
  Wallet,
  PieChart,
  DollarSign,
  Package,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { transactions, products } = usePos();

  const completedTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'completed');
  }, [transactions]);

  // Overall Financials
  const totalOmzet = completedTransactions.reduce((acc, t) => acc + t.total, 0);
  const totalHPP = completedTransactions.reduce((acc, t) => acc + (t.totalCostPrice || 0), 0);
  const totalGrossProfit = totalOmzet - totalHPP;
  const grossMarginPct = totalOmzet > 0 ? Math.round((totalGrossProfit / totalOmzet) * 100) : 0;

  // Top Selling Products Calculation
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; revenue: number; category: string }>();

    completedTransactions.forEach(t => {
      t.items.forEach(item => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          const prodObj = products.find(p => p.id === item.productId);
          map.set(item.productId, {
            name: item.productName,
            quantity: item.quantity,
            revenue: item.subtotal,
            category: prodObj?.category || 'Umum',
          });
        }
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);
  }, [completedTransactions, products]);

  const maxSoldQty = topProducts.length > 0 ? topProducts[0].quantity : 1;

  // Payment Methods Breakdown
  const paymentBreakdown = useMemo(() => {
    const summary: Record<PaymentMethod, { count: number; total: number }> = {
      cash: { count: 0, total: 0 },
      qris: { count: 0, total: 0 },
      ewallet: { count: 0, total: 0 },
      transfer: { count: 0, total: 0 },
      debit: { count: 0, total: 0 },
    };

    completedTransactions.forEach(t => {
      const m = t.paymentMethod;
      if (summary[m]) {
        summary[m].count += 1;
        summary[m].total += t.total;
      }
    });

    return [
      {
        method: 'cash',
        label: 'Tunai (Cash)',
        count: summary.cash.count,
        total: summary.cash.total,
        percentage: totalOmzet > 0 ? Math.round((summary.cash.total / totalOmzet) * 100) : 0,
        color: 'bg-emerald-500',
      },
      {
        method: 'qris',
        label: 'QRIS Dinamis',
        count: summary.qris.count,
        total: summary.qris.total,
        percentage: totalOmzet > 0 ? Math.round((summary.qris.total / totalOmzet) * 100) : 0,
        color: 'bg-cyan-500',
      },
      {
        method: 'ewallet',
        label: 'E-Wallet',
        count: summary.ewallet.count,
        total: summary.ewallet.total,
        percentage: totalOmzet > 0 ? Math.round((summary.ewallet.total / totalOmzet) * 100) : 0,
        color: 'bg-amber-500',
      },
      {
        method: 'transfer',
        label: 'Transfer Bank',
        count: summary.transfer.count,
        total: summary.transfer.total,
        percentage: totalOmzet > 0 ? Math.round((summary.transfer.total / totalOmzet) * 100) : 0,
        color: 'bg-violet-500',
      },
      {
        method: 'debit',
        label: 'Kartu Debit / EDC',
        count: summary.debit.count,
        total: summary.debit.total,
        percentage: totalOmzet > 0 ? Math.round((summary.debit.total / totalOmzet) * 100) : 0,
        color: 'bg-indigo-500',
      },
    ].filter(item => item.count > 0 || item.method === 'cash' || item.method === 'qris');
  }, [completedTransactions, totalOmzet]);

  // Category Breakdown
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { totalRevenue: number; totalQty: number }>();

    completedTransactions.forEach(t => {
      t.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        const cat = prod?.category || 'Lainnya';
        const existing = map.get(cat) || { totalRevenue: 0, totalQty: 0 };
        existing.totalRevenue += item.subtotal;
        existing.totalQty += item.quantity;
        map.set(cat, existing);
      });
    });

    return Array.from(map.entries())
      .map(([category, val]) => ({
        category,
        ...val,
        percentage: totalOmzet > 0 ? Math.round((val.totalRevenue / totalOmzet) * 100) : 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [completedTransactions, products, totalOmzet]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight">
          Laporan Kinerja &amp; Analitik Penjualan
        </h2>
        <p className="text-xs text-neutral-400">
          Ringkasan omzet, laba kotor, produk terlaris, dan distribusi saluran pembayaran.
        </p>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Omzet Penjualan</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {formatRupiah(totalOmzet)}
          </div>
          <div className="text-[11px] text-neutral-500">
            Dari {completedTransactions.length} transaksi selesai
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Modal Barang (HPP)</span>
            <Package className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-neutral-200 tabular-nums">
            {formatRupiah(totalHPP)}
          </div>
          <div className="text-[11px] text-neutral-500">
            Biaya pokok perolehan stok
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Keuntungan Kotor</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {formatRupiah(totalGrossProfit)}
          </div>
          <div className="text-[11px] text-neutral-500">
            Laba sebelum biaya operasional
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Margin Keuntungan</span>
            <PieChart className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {grossMarginPct}%
          </div>
          <div className="text-[11px] text-neutral-500">
            Persentase margin rata-rata
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Products vs Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-neutral-100">Produk Terlaris (Top Sales)</h3>
            </div>
            <span className="text-xs text-neutral-400 font-medium">Berdasarkan Kuantitas</span>
          </div>

          <div className="space-y-3 pt-1">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-center font-mono font-bold text-neutral-500 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-neutral-200">{prod.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    <span className="font-bold text-white">{prod.quantity} terjual</span>
                    <span className="text-neutral-500">·</span>
                    <span className="text-emerald-400">{formatRupiah(prod.revenue)}</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full bg-neutral-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((prod.quantity / maxSoldQty) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}

            {topProducts.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500">
                Belum ada transaksi penjualan yang tercatat.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-neutral-100">Distribusi Metode Pembayaran</h3>
            </div>
            <span className="text-xs text-neutral-400 font-mono">100% Saluran Kasir</span>
          </div>

          <div className="space-y-4 pt-1">
            {paymentBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-semibold text-neutral-200">{item.label}</span>
                  </div>
                  <div className="font-mono tabular-nums">
                    <span className="font-bold text-white">{item.percentage}%</span>
                    <span className="text-neutral-500 text-[11px] ml-1">
                      ({item.count} transaksi)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-neutral-900 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${item.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-neutral-400 pt-0.5">
                  <span>Total Nominal Diterima</span>
                  <span className="font-mono font-semibold text-neutral-200 tabular-nums">
                    {formatRupiah(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
        <h3 className="font-bold text-sm text-neutral-100">
          Penjualan Berdasarkan Kategori Produk
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[11px] font-semibold bg-neutral-950/50">
                <th className="py-2.5 px-4">Kategori</th>
                <th className="py-2.5 px-4 text-center">Unit Terjual</th>
                <th className="py-2.5 px-4 text-right">Kontribusi Omzet</th>
                <th className="py-2.5 px-4 text-right">Porsi (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {categoryBreakdown.map((cat, idx) => (
                <tr key={idx} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{cat.category}</td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-neutral-300">
                    {cat.totalQty} unit
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400 tabular-nums">
                    {formatRupiah(cat.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-300">
                    {cat.percentage}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
