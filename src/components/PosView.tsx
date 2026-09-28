import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Product, ProductCategory } from '../types/pos';
import { formatRupiah } from '../utils/formatters';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Barcode,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Tag,
  Percent,
  Camera,
} from 'lucide-react';

interface PosViewProps {
  onOpenCheckout: () => void;
}

export const PosView: React.FC<PosViewProps> = ({ onOpenCheckout }) => {
  const {
    products,
    cart,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartTotals,
    cartDiscount,
    setCartDiscount,
    cartTaxEnabled,
    setCartTaxEnabled,
  } = usePos();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [discountInputType, setDiscountInputType] = useState<'nominal' | 'percent'>('nominal');
  const [discountPercentValue, setDiscountPercentValue] = useState<number>(0);
  const [isCameraScannerOpen, setIsCameraScannerOpen] = useState(false);

  const categories: { id: string; label: string }[] = [
    { id: 'all', label: 'Semua Produk' },
    { id: 'Sembako', label: 'Sembako' },
    { id: 'Minuman', label: 'Minuman' },
    { id: 'Makanan', label: 'Makanan' },
    { id: 'Snack', label: 'Snack' },
    { id: 'Kebutuhan Rumah', label: 'Kebutuhan Rumah' },
    { id: 'ATK', label: 'ATK' },
  ];

  // Show temporary toast notification for stock limits or feedback
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.barcode.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [products, searchQuery, selectedCategory]);

  // Handle barcode scanner fast entry (pressing Enter in search box)
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const exactMatch = products.find(
        p =>
          p.barcode.toLowerCase() === q ||
          p.sku.toLowerCase() === q ||
          p.name.toLowerCase() === q
      );

      if (exactMatch) {
        const res = addToCart(exactMatch, 1);
        if (res.success) {
          showToast(`+1 ${exactMatch.name} masuk keranjang`);
          setSearchQuery('');
        } else {
          showToast(res.message || 'Gagal menambahkan');
        }
      }
    }
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    const code = scannedCode.toLowerCase().trim();
    const found = products.find(
      p =>
        p.barcode.toLowerCase() === code ||
        p.sku.toLowerCase() === code ||
        p.name.toLowerCase() === code
    );

    if (found) {
      if (found.stock <= 0) {
        showToast(`Stok "${found.name}" habis.`);
        return;
      }
      const res = addToCart(found, 1);
      if (res.success) {
        showToast(`+1 "${found.name}" berhasil di-scan!`);
      } else {
        showToast(res.message || 'Gagal menambahkan produk');
      }
    } else {
      showToast(`Produk dengan kode "${scannedCode}" tidak ditemukan di database.`);
    }
  };

  const handleProductCardClick = (product: Product) => {
    if (product.stock <= 0) {
      showToast(`Stok ${product.name} habis! Lakukan restok di menu Stok Barang.`);
      return;
    }
    const res = addToCart(product, 1);
    if (!res.success) {
      showToast(res.message || 'Stok tidak mencukupi');
    }
  };

  // Discount percentage helper
  const handleDiscountPercentChange = (pct: number) => {
    const validPct = Math.min(100, Math.max(0, pct));
    setDiscountPercentValue(validPct);
    const nominal = Math.round((cartTotals.subtotal * validPct) / 100);
    setCartDiscount(nominal);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-800 text-neutral-100 border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs animate-bounce">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Grid: Left Catalog (col-span-8), Right Cart (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Search, Categories & Catalog */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Controls: Search by Name / Barcode & Camera Scanner */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari nama barang, SKU, atau scan barcode fisik (Tekan Enter)..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <div className="absolute right-3 top-2.5 text-neutral-500 pointer-events-none flex items-center gap-1">
                <Barcode className="w-4 h-4" />
              </div>
            </div>

            {/* Camera Barcode Scanner trigger button */}
            <button
              type="button"
              onClick={() => setIsCameraScannerOpen(true)}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95 shrink-0"
              title="Buka Scanner Barcode Kamera HP / Webcam"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Kamera HP</span>
            </button>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-3 py-2 text-xs text-neutral-400 hover:text-white bg-neutral-800 rounded-xl transition-colors shrink-0"
              >
                Reset Cari
              </button>
            )}
          </div>

          {/* Category Tabs (Segmented controls - no pills) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors shrink-0 ${
                    active
                      ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-sm'
                      : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inCart = cart.find(c => c.product.id === product.id);
              const isOutOfStock = product.stock <= 0;
              const isLowStock = !isOutOfStock && product.stock <= product.minStockAlert;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductCardClick(product)}
                  className={`group relative flex flex-col justify-between p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                    isOutOfStock
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                      : inCart
                      ? 'bg-neutral-800/90 border-emerald-500/80 shadow-md shadow-emerald-950/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60'
                  }`}
                >
                  {/* Top card info */}
                  <div>
                    {/* Category & SKU as clean unboxed text */}
                    <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                      <span className="truncate max-w-[100px]">{product.category}</span>
                      <span className="font-mono text-neutral-400">{product.sku}</span>
                    </div>

                    {/* Product Name */}
                    <h4 className="text-xs font-semibold text-neutral-100 line-clamp-2 leading-snug group-hover:text-emerald-300 transition-colors">
                      {product.name}
                    </h4>
                  </div>

                  {/* Bottom card details */}
                  <div className="mt-3 pt-2 border-t border-neutral-800/70">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                        {formatRupiah(product.sellingPrice)}
                      </div>
                      <span className="text-[10px] text-neutral-400">/{product.unit}</span>
                    </div>

                    {/* Stock Status text */}
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      {isOutOfStock ? (
                        <span className="text-rose-400 font-medium">Stok Habis (0)</span>
                      ) : isLowStock ? (
                        <span className="text-amber-400 font-medium">
                          Sisa {product.stock} {product.unit}
                        </span>
                      ) : (
                        <span className="text-neutral-400">
                          Stok: <span className="font-mono text-neutral-300">{product.stock}</span> {product.unit}
                        </span>
                      )}

                      {inCart && (
                        <span className="font-mono font-bold text-xs text-emerald-300 bg-emerald-950/70 px-1.5 py-0.5 rounded border border-emerald-800/80">
                          {inCart.quantity}x
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-10 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-neutral-600 mx-auto" />
              <h3 className="text-sm font-semibold text-neutral-300">
                Tidak ada produk ditemukan
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                Coba gunakan kata kunci lain atau pilih kategori &quot;Semua Produk&quot;.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-3.5 py-1.5 text-xs text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  Bersihkan Pencarian
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Interactive Cart & Order Checkout */}
        <div className="lg:col-span-4">
          <div className="sticky top-20 bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col h-[calc(100vh-6.5rem)]">
            {/* Cart Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-neutral-100">Keranjang Belanja</h3>
                <span className="text-xs text-neutral-400 font-mono">
                  ({cartTotals.itemCount} item)
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                  title="Kosongkan Keranjang"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Kosongkan</span>
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
              {cart.map(item => (
                <div
                  key={item.product.id}
                  className="p-3 bg-neutral-950/70 border border-neutral-800/80 rounded-xl space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-200 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {formatRupiah(item.product.sellingPrice)} / {item.product.unit}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-neutral-500 hover:text-rose-400 p-1 transition-colors"
                      title="Hapus barang"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Stepper and Line Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-neutral-700/80 rounded-lg overflow-hidden bg-neutral-900">
                      <button
                        type="button"
                        onClick={() =>
                          updateCartQuantity(item.product.id, item.quantity - 1)
                        }
                        className="px-2 py-1 text-neutral-300 hover:bg-neutral-800 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 1;
                          updateCartQuantity(item.product.id, val);
                        }}
                        className="w-10 text-center bg-transparent text-xs font-mono font-semibold text-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const res = updateCartQuantity(
                            item.product.id,
                            item.quantity + 1
                          );
                          if (!res.success) {
                            showToast(res.message || 'Stok tidak mencukupi');
                          }
                        }}
                        className="px-2 py-1 text-neutral-300 hover:bg-neutral-800 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-xs font-mono font-bold text-neutral-200 tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                </div>
              ))}

              {cart.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 mb-1">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-medium text-neutral-400">Keranjang masih kosong</p>
                  <p className="text-[11px] text-neutral-400 max-w-[200px]">
                    Klik produk di sebelah kiri atau scan barcode untuk menambahkan barang.
                  </p>
                </div>
              )}
            </div>

            {/* Cart Summary & Checkout Footer */}
            {cart.length > 0 && (
              <div className="pt-3 border-t border-neutral-800 space-y-3">
                {/* Discount and Tax expandable / toggles */}
                <div className="space-y-2 text-xs">
                  {/* Discount row */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-neutral-400 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Diskon
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => setDiscountInputType('nominal')}
                          className={`px-1.5 py-0.5 text-[10px] rounded ${
                            discountInputType === 'nominal'
                              ? 'bg-neutral-800 text-white font-semibold'
                              : 'text-neutral-400'
                          }`}
                        >
                          Rp
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountInputType('percent')}
                          className={`px-1.5 py-0.5 text-[10px] rounded ${
                            discountInputType === 'percent'
                              ? 'bg-neutral-800 text-white font-semibold'
                              : 'text-neutral-400'
                          }`}
                        >
                          %
                        </button>
                      </div>

                      {discountInputType === 'nominal' ? (
                        <input
                          type="number"
                          min="0"
                          value={cartDiscount || ''}
                          onChange={e =>
                            setCartDiscount(Math.max(0, parseInt(e.target.value) || 0))
                          }
                          placeholder="0"
                          className="w-20 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-right text-xs font-mono text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                        />
                      ) : (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={discountPercentValue || ''}
                          onChange={e =>
                            handleDiscountPercentChange(parseInt(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-16 bg-neutral-950 border border-neutral-800 rounded-lg px-2 py-1 text-right text-xs font-mono text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                        />
                      )}
                    </div>
                  </div>

                  {/* Tax PPN 11% Toggle */}
                  <div className="flex items-center justify-between text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5" /> PPN 11%
                    </span>
                    <button
                      type="button"
                      onClick={() => setCartTaxEnabled(!cartTaxEnabled)}
                      className={`text-xs px-2 py-0.5 rounded-md border font-medium transition-colors ${
                        cartTaxEnabled
                          ? 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {cartTaxEnabled ? 'Aktif (11%)' : 'Non-Aktif'}
                    </button>
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="space-y-1 text-xs pt-2 border-t border-neutral-800/80">
                  <div className="flex justify-between text-neutral-400">
                    <span>Subtotal</span>
                    <span className="font-mono tabular-nums text-neutral-200">
                      {formatRupiah(cartTotals.subtotal)}
                    </span>
                  </div>
                  {cartTotals.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Diskon</span>
                      <span className="font-mono tabular-nums">
                        -{formatRupiah(cartTotals.discount)}
                      </span>
                    </div>
                  )}
                  {cartTotals.tax > 0 && (
                    <div className="flex justify-between text-neutral-400">
                      <span>Pajak (PPN 11%)</span>
                      <span className="font-mono tabular-nums text-neutral-200">
                        {formatRupiah(cartTotals.tax)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-baseline pt-2 border-t border-neutral-700">
                    <span className="text-sm font-bold text-white">TOTAL</span>
                    <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                      {formatRupiah(cartTotals.total)}
                    </span>
                  </div>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={onOpenCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 active:scale-[0.99]"
                >
                  <span>Bayar Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Camera Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isCameraScannerOpen}
        onClose={() => setIsCameraScannerOpen(false)}
        onScan={handleBarcodeScanned}
      />
    </div>
  );
};
