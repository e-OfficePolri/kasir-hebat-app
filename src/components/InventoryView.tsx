import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Product, ProductCategory, StockMovementType } from '../types/pos';
import { formatRupiah, formatDateTime, generateSKU } from '../utils/formatters';
import {
  Plus,
  Search,
  AlertTriangle,
  ArrowUpDown,
  History,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  PackagePlus,
  Barcode,
  Layers,
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    products,
    stockMovements,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    lowStockCount,
  } = usePos();

  const [activeTab, setActiveTab] = useState<'catalog' | 'movements'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockType, setRestockType] = useState<'restock' | 'adjustment'>('restock');
  const [restockNote, setRestockNote] = useState<string>('Restok barang masuk');

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sembako' as ProductCategory,
    sku: '',
    barcode: '',
    costPrice: 0,
    sellingPrice: 0,
    stock: 0,
    minStockAlert: 5,
    unit: 'pcs',
  });

  const categories: ProductCategory[] = [
    'Sembako',
    'Minuman',
    'Makanan',
    'Snack',
    'Kebutuhan Rumah',
    'ATK',
    'Lainnya',
  ];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory =
        categoryFilter === 'all' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q);

      let matchesStock = true;
      if (stockStatusFilter === 'low') {
        matchesStock = p.stock > 0 && p.stock <= p.minStockAlert;
      } else if (stockStatusFilter === 'out') {
        matchesStock = p.stock <= 0;
      }

      return matchesCategory && matchesSearch && matchesStock;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter]);

  // Open Add Modal with fresh default values
  const handleOpenAdd = () => {
    const defaultSku = generateSKU('SMB', 'BARANG');
    const defaultBarcode = `899${Math.floor(100000000 + Math.random() * 900000000)}`;
    setFormData({
      name: '',
      category: 'Sembako',
      sku: defaultSku,
      barcode: defaultBarcode,
      costPrice: 10000,
      sellingPrice: 13000,
      stock: 20,
      minStockAlert: 5,
      unit: 'pcs',
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal with product values
  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setFormData({
      name: prod.name,
      category: prod.category,
      sku: prod.sku,
      barcode: prod.barcode,
      costPrice: prod.costPrice,
      sellingPrice: prod.sellingPrice,
      stock: prod.stock,
      minStockAlert: prod.minStockAlert,
      unit: prod.unit,
    });
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formData.name,
        category: formData.category,
        sku: formData.sku,
        barcode: formData.barcode,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock),
        minStockAlert: Number(formData.minStockAlert),
        unit: formData.unit,
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: formData.name,
        category: formData.category,
        sku: formData.sku || generateSKU(formData.category, formData.name),
        barcode: formData.barcode || `899${Date.now().toString().slice(-9)}`,
        costPrice: Number(formData.costPrice),
        sellingPrice: Number(formData.sellingPrice),
        stock: Number(formData.stock),
        minStockAlert: Number(formData.minStockAlert),
        unit: formData.unit,
      });
      setIsAddModalOpen(false);
    }
  };

  // Handle Quick Restock submit
  const handleExecuteRestock = () => {
    if (!restockProduct) return;
    const delta = restockType === 'restock' ? Math.abs(restockAmount) : -Math.abs(restockAmount);
    adjustStock(restockProduct.id, delta, restockType, restockNote);
    setRestockProduct(null);
  };

  const getMovementBadgeColor = (type: StockMovementType) => {
    switch (type) {
      case 'sale':
        return 'text-rose-400';
      case 'restock':
        return 'text-emerald-400';
      case 'refund':
        return 'text-blue-400';
      case 'adjustment':
        return 'text-amber-400';
      default:
        return 'text-neutral-400';
    }
  };

  const getMovementLabel = (type: StockMovementType) => {
    switch (type) {
      case 'sale':
        return 'Penjualan (Otomatis)';
      case 'restock':
        return 'Restok Masuk';
      case 'refund':
        return 'Refund / Batal';
      case 'adjustment':
        return 'Penyesuaian Fisik';
      default:
        return type;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Low Stock Banner Alert */}
      {lowStockCount > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-amber-300">
                Peringatan Stok Menipis ({lowStockCount} Barang)
              </h4>
              <p className="text-xs text-amber-400/80">
                Beberapa produk telah mencapai atau berada di bawah batas stok minimum. Segera lakukan pemesanan restok ke supplier.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('catalog');
              setStockStatusFilter(stockStatusFilter === 'low' ? 'all' : 'low');
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-neutral-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0"
          >
            {stockStatusFilter === 'low' ? 'Tampilkan Semua Barang' : 'Filter Barang Menipis'}
          </button>
        </div>
      )}

      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'catalog'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Katalog &amp; Stok Barang</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'movements'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Mutasi Stok Otomatis</span>
          </button>
        </div>

        {activeTab === 'catalog' && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Produk Baru</span>
          </button>
        )}
      </div>

      {/* TAB 1: CATALOG & INVENTORY */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Cari SKU, barcode, nama produk..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <select
                value={stockStatusFilter}
                onChange={e => setStockStatusFilter(e.target.value as 'all' | 'low' | 'out')}
                className="bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Semua Status Stok</option>
                <option value="low">Hanya Stok Menipis</option>
                <option value="out">Hanya Stok Habis (0)</option>
              </select>

              {(searchQuery || categoryFilter !== 'all' || stockStatusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                    setStockStatusFilter('all');
                  }}
                  className="text-xs text-neutral-400 hover:text-white px-2 py-1"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[11px] font-semibold bg-neutral-950/60">
                    <th className="py-3 px-4">SKU / Barcode</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4 text-right">Harga Beli (HPP)</th>
                    <th className="py-3 px-4 text-right">Harga Jual</th>
                    <th className="py-3 px-4 text-right">Margin</th>
                    <th className="py-3 px-4 text-center">Stok Saat Ini</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {filteredProducts.map(prod => {
                    const isOutOfStock = prod.stock <= 0;
                    const isLowStock = !isOutOfStock && prod.stock <= prod.minStockAlert;
                    const profitMargin = prod.sellingPrice > 0
                      ? Math.round(((prod.sellingPrice - prod.costPrice) / prod.sellingPrice) * 100)
                      : 0;

                    return (
                      <tr
                        key={prod.id}
                        className="hover:bg-neutral-800/40 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono text-neutral-300">
                          <div>{prod.sku}</div>
                          <div className="text-[10px] text-neutral-400">{prod.barcode}</div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white max-w-xs truncate">
                          {prod.name}
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {prod.category}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-400">
                          {formatRupiah(prod.costPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-emerald-400">
                          {formatRupiah(prod.sellingPrice)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-neutral-300">
                          {profitMargin}%
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono tabular-nums">
                          <span className="font-bold text-sm text-neutral-100">
                            {prod.stock}
                          </span>{' '}
                          <span className="text-[11px] text-neutral-400">{prod.unit}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isOutOfStock ? (
                            <span className="text-rose-400 font-semibold text-[11px]">
                              Habis
                            </span>
                          ) : isLowStock ? (
                            <span className="text-amber-400 font-semibold text-[11px]">
                              Menipis (Min {prod.minStockAlert})
                            </span>
                          ) : (
                            <span className="text-emerald-400 text-[11px]">
                              Tersedia
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setRestockProduct(prod);
                                setRestockAmount(10);
                                setRestockType('restock');
                                setRestockNote('Restok barang masuk');
                              }}
                              className="px-2 py-1 bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900/80 rounded-lg text-[11px] font-medium transition-colors"
                              title="Restok Barang"
                            >
                              Restok
                            </button>
                            <button
                              onClick={() => handleOpenEdit(prod)}
                              className="p-1.5 text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                              title="Edit Produk"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Yakin ingin menghapus produk "${prod.name}"?`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="p-1.5 text-neutral-500 hover:text-rose-400 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                              title="Hapus Produk"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-neutral-400 space-y-2">
                  <p className="text-sm font-medium">Tidak ada data produk yang cocok</p>
                  <p className="text-xs text-neutral-400">Silakan ubah filter atau tambahkan produk baru.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT MUTASI STOK OTOMATIS */}
      {activeTab === 'movements' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-100">
                  Log Audit Perubahan Stok Barang
                </h4>
                <p className="text-xs text-neutral-400">
                  Setiap transaksi penjualan di kasir otomatis memotong stok barang dan tercatat di sini secara real-time.
                </p>
              </div>
              <span className="font-mono text-xs text-neutral-400 bg-neutral-950 px-2.5 py-1 rounded-lg border border-neutral-800">
                Total Mutasi: {stockMovements.length}
              </span>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[11px] font-semibold bg-neutral-950/60">
                    <th className="py-3 px-4">Waktu</th>
                    <th className="py-3 px-4">Nama Produk</th>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Jenis Mutasi</th>
                    <th className="py-3 px-4 text-center">Perubahan</th>
                    <th className="py-3 px-4 text-center">Stok Awal</th>
                    <th className="py-3 px-4 text-center">Stok Akhir</th>
                    <th className="py-3 px-4">Keterangan / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/80">
                  {stockMovements.map(mov => (
                    <tr key={mov.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-neutral-400 whitespace-nowrap">
                        {formatDateTime(mov.timestamp)}
                      </td>
                      <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                        {mov.productName}
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400">{mov.sku}</td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${getMovementBadgeColor(mov.type)}`}>
                          {getMovementLabel(mov.type)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold tabular-nums">
                        <span
                          className={mov.quantityDelta > 0 ? 'text-emerald-400' : 'text-rose-400'}
                        >
                          {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-neutral-400">
                        {mov.previousStock}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-white font-bold">
                        {mov.currentStock}
                      </td>
                      <td className="py-3 px-4 text-neutral-300 text-[11px]">
                        <div>{mov.note}</div>
                        {mov.referenceId && (
                          <div className="font-mono text-neutral-400 text-[10px]">
                            {mov.referenceId}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stockMovements.length === 0 && (
                <div className="py-12 text-center text-neutral-400">
                  Belum ada catatan mutasi stok. Lakukan transaksi kasir untuk melihat pemotongan otomatis.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h3 className="font-bold text-neutral-100 text-sm">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru ke Stok'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Nama Produk <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Beras Ramos 5kg / Kopi Gula Aren"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Kategori
                  </label>
                  <select
                    value={formData.category}
                    onChange={e =>
                      setFormData({ ...formData, category: e.target.value as ProductCategory })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Satuan Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pcs / kg / botol / sak"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    SKU Kode Barang
                  </label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Barcode (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Harga Modal / Beli (HPP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={e =>
                      setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Harga Jual Kasir <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={e =>
                      setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-emerald-400 font-semibold focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Stok Awal
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={e =>
                      setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-300 block mb-1">
                    Batas Peringatan Stok Menipis
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={e =>
                      setFormData({ ...formData, minStockAlert: parseInt(e.target.value) || 1 })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: QUICK RESTOCK / ADJUSTMENT */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-neutral-100 text-sm">
                  Restok / Sesuaikan Stok Barang
                </h3>
              </div>
              <button
                onClick={() => setRestockProduct(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div className="text-xs text-neutral-400">Produk Terpilih:</div>
                <div className="text-sm font-bold text-white mt-0.5">{restockProduct.name}</div>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1 font-mono">
                  <span>SKU: {restockProduct.sku}</span>
                  <span>·</span>
                  <span>
                    Stok Saat Ini: <b className="text-emerald-400">{restockProduct.stock}</b> {restockProduct.unit}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1.5">
                  Tindakan
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRestockType('restock');
                      setRestockNote('Restok dari supplier');
                    }}
                    className={`p-2.5 text-xs font-semibold rounded-lg border transition-colors ${
                      restockType === 'restock'
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    + Tambah Stok (Restok)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRestockType('adjustment');
                      setRestockNote('Barang rusak / kadaluarsa');
                    }}
                    className={`p-2.5 text-xs font-semibold rounded-lg border transition-colors ${
                      restockType === 'adjustment'
                        ? 'border-amber-500 bg-amber-950/40 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400'
                    }`}
                  >
                    - Kurangi Stok (Rusak/Audit)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Jumlah ({restockProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Catatan Keterangan
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={e => setRestockNote(e.target.value)}
                  placeholder="Contoh: Penerimaan PO Supplier CV Makmur"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Result Preview */}
              <div className="pt-2 border-t border-neutral-800 flex justify-between text-xs">
                <span className="text-neutral-400">Estimasi Stok Akhir:</span>
                <span className="font-mono font-bold text-white">
                  {restockType === 'restock'
                    ? restockProduct.stock + restockAmount
                    : Math.max(0, restockProduct.stock - restockAmount)}{' '}
                  {restockProduct.unit}
                </span>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockProduct(null)}
                  className="px-4 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestock}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors shadow-sm"
                >
                  Terapkan Perubahan Stok
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
