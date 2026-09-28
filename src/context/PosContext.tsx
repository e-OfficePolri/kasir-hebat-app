import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Transaction,
  StockMovement,
  StoreSettings,
  TabType,
  PaymentMethod,
  EWalletProvider,
  UserProfile,
} from '../types/pos';
import {
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import { generateTransactionId } from '../utils/formatters';
import { soundEffects } from '../utils/soundEffects';
import {
  db,
  auth,
  testConnection,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

interface PosContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  settings: StoreSettings;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  // Cart Actions
  addToCart: (product: Product, quantity?: number) => { success: boolean; message?: string };
  updateCartQuantity: (productId: string, quantity: number) => { success: boolean; message?: string };
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotals: {
    itemCount: number;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
  };
  cartDiscount: number;
  setCartDiscount: (discount: number) => void;
  cartTaxEnabled: boolean;
  setCartTaxEnabled: (enabled: boolean) => void;
  // Checkout & Transactions
  checkout: (data: {
    paymentMethod: PaymentMethod;
    ewalletProvider?: EWalletProvider;
    amountPaid: number;
    customerName: string;
    notes?: string;
  }) => { success: boolean; transaction?: Transaction; message?: string };
  refundTransaction: (transactionId: string, reason: string) => { success: boolean; message?: string };
  // Product & Inventory Actions
  addProduct: (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updatedFields: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (
    productId: string,
    delta: number,
    type: 'restock' | 'adjustment',
    note: string
  ) => { success: boolean; message?: string };
  // Settings & Storage
  updateSettings: (newSettings: StoreSettings) => void;
  resetToSampleData: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => { success: boolean; message: string };
  // Low stock counter helper
  lowStockCount: number;
  // User Authentication
  currentUser: UserProfile | null;
  loginUser: (user: UserProfile) => void;
  logoutUser: () => void;
  // Cloud Database Status
  isCloudConnected: boolean;
  isSyncing: boolean;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

const STORAGE_KEY = 'kasirpro_pos_state_v1';

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    try {
      const savedUser = localStorage.getItem(`${STORAGE_KEY}_user`);
      return savedUser ? 'pos' : 'home';
    } catch {
      return 'home';
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [cartTaxEnabled, setCartTaxEnabled] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_stock_movements`);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? { ...INITIAL_SETTINGS, ...JSON.parse(saved) } : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Validate Firestore server connection on startup
  useEffect(() => {
    testConnection().then(connected => {
      setIsCloudConnected(connected);
    });
  }, []);

  // Save to LocalStorage as resilient offline backup cache
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to storage', e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to storage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_stock_movements`, JSON.stringify(stockMovements));
    } catch (e) {
      console.error('Error saving stock movements to storage', e);
    }
  }, [stockMovements]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to storage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(`${STORAGE_KEY}_user`);
      }
    } catch (e) {
      console.error('Error saving user to storage', e);
    }
  }, [currentUser]);

  // Firestore Real-Time Syncing when user is logged in
  useEffect(() => {
    if (!currentUser || !auth.currentUser) return;
    const currentUserId = auth.currentUser.uid;

    setIsSyncing(true);

    // 1. Sync Products
    const productsPath = 'products';
    const productsQuery = query(collection(db, productsPath), where('ownerId', '==', currentUserId));
    const unsubscribeProducts = onSnapshot(
      productsQuery,
      snapshot => {
        if (!snapshot.empty) {
          const cloudProducts: Product[] = [];
          snapshot.forEach(docSnap => {
            cloudProducts.push(docSnap.data() as Product);
          });
          setProducts(cloudProducts);
        } else {
          // If Firestore is empty for this user, seed with initial products in Cloud
          INITIAL_PRODUCTS.forEach(p => {
            const productWithUID = { ...p, ownerId: currentUserId };
            setDoc(doc(db, productsPath, p.id), productWithUID).catch(() => {});
          });
        }
        setIsSyncing(false);
      },
      error => {
        setIsSyncing(false);
        try {
          handleFirestoreError(error, OperationType.GET, productsPath);
        } catch {
          // Continue gracefully with local cache if rules restrict
        }
      }
    );

    // 2. Sync Transactions
    const trxPath = 'transactions';
    const trxQuery = query(collection(db, trxPath), where('ownerId', '==', currentUserId));
    const unsubscribeTransactions = onSnapshot(
      trxQuery,
      snapshot => {
        if (!snapshot.empty) {
          const cloudTrx: Transaction[] = [];
          snapshot.forEach(docSnap => {
            cloudTrx.push(docSnap.data() as Transaction);
          });
          // Sort newest first
          cloudTrx.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setTransactions(cloudTrx);
        }
      },
      error => {
        try {
          handleFirestoreError(error, OperationType.GET, trxPath);
        } catch {
          // Continue gracefully
        }
      }
    );

    return () => {
      unsubscribeProducts();
      unsubscribeTransactions();
    };
  }, [currentUser]);

  const loginUser = (user: UserProfile) => {
    setCurrentUser(user);
    setSettings(prev => ({
      ...prev,
      storeName: user.storeName || prev.storeName,
      activeCashierName: user.name || prev.activeCashierName,
      phone: user.phone || prev.phone,
    }));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Low stock counter
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const effectiveDiscount = Math.min(cartDiscount, cartSubtotal);
  const afterDiscount = Math.max(0, cartSubtotal - effectiveDiscount);
  const cartTax = cartTaxEnabled ? Math.round(afterDiscount * (settings.taxPercent / 100)) : 0;
  const cartTotal = afterDiscount + cartTax;

  const cartTotals = {
    itemCount: cartItemCount,
    subtotal: cartSubtotal,
    discount: effectiveDiscount,
    tax: cartTax,
    total: cartTotal,
  };

  // Add to cart with real-time stock boundary checks
  const addToCart = (product: Product, quantity = 1): { success: boolean; message?: string } => {
    const currentProduct = products.find(p => p.id === product.id) || product;
    
    if (currentProduct.stock <= 0) {
      return { success: false, message: `Stok ${currentProduct.name} sedang habis!` };
    }

    const existingIndex = cart.findIndex(item => item.product.id === product.id);
    const currentCartQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (currentCartQty + quantity > currentProduct.stock) {
      return {
        success: false,
        message: `Stok tidak cukup. Tersisa ${currentProduct.stock} ${currentProduct.unit}.`,
      };
    }

    setCart(prev => {
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          subtotal: newQty * product.sellingPrice,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product: currentProduct,
          quantity,
          discountNominal: 0,
          subtotal: quantity * currentProduct.sellingPrice,
        },
      ];
    });

    soundEffects.playScanBeep();
    return { success: true };
  };

  const updateCartQuantity = (productId: string, quantity: number): { success: boolean; message?: string } => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return { success: true };
    }

    const product = products.find(p => p.id === productId);
    if (!product) return { success: false, message: 'Produk tidak ditemukan.' };

    if (quantity > product.stock) {
      return {
        success: false,
        message: `Jumlah melebihi stok tersedia (${product.stock} ${product.unit}).`,
      };
    }

    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: Math.max(0, quantity * item.product.sellingPrice - (item.discountNominal || 0)),
            }
          : item
      )
    );
    return { success: true };
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
  };

  // CHECKOUT: Atomic sales record and stock decrement
  const checkout = (data: {
    paymentMethod: PaymentMethod;
    ewalletProvider?: EWalletProvider;
    amountPaid: number;
    customerName: string;
    notes?: string;
  }): { success: boolean; transaction?: Transaction; message?: string } => {
    if (cart.length === 0) {
      return { success: false, message: 'Keranjang belanja masih kosong.' };
    }

    // Verify stock availability
    for (const item of cart) {
      const prod = products.find(p => p.id === item.product.id);
      if (!prod || prod.stock < item.quantity) {
        return {
          success: false,
          message: `Stok ${item.product.name} tidak mencukupi untuk transaksi ini!`,
        };
      }
    }

    const transactionId = generateTransactionId();
    const nowIso = new Date().toISOString();
    const change = Math.max(0, data.amountPaid - cartTotals.total);

    const totalCostPrice = cart.reduce((acc, item) => acc + item.product.costPrice * item.quantity, 0);
    const grossProfit = cartTotals.total - totalCostPrice;

    const transaction: Transaction = {
      id: transactionId,
      timestamp: nowIso,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        costPrice: item.product.costPrice,
        unitPrice: item.product.sellingPrice,
        quantity: item.quantity,
        discountNominal: item.discountNominal || 0,
        subtotal: item.subtotal,
        unit: item.product.unit,
      })),
      subtotal: cartTotals.subtotal,
      discount: cartTotals.discount,
      tax: cartTotals.tax,
      total: cartTotals.total,
      totalCostPrice,
      grossProfit,
      paymentMethod: data.paymentMethod,
      ewalletProvider: data.ewalletProvider,
      amountPaid: data.amountPaid,
      change,
      customerName: data.customerName || 'Pelanggan Umum',
      cashierName: settings.activeCashierName || (currentUser?.name ?? 'Kasir Utama'),
      notes: data.notes,
      status: 'completed',
    };

    const newStockMovements: StockMovement[] = [];
    const currentUserId = auth.currentUser?.uid || 'offline-user';

    const updatedProducts = products.map(prod => {
      const inCart = cart.find(c => c.product.id === prod.id);
      if (inCart) {
        const newStock = Math.max(0, prod.stock - inCart.quantity);
        newStockMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: nowIso,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'sale',
          quantityDelta: -inCart.quantity,
          previousStock: prod.stock,
          currentStock: newStock,
          note: `Penjualan Kasir (${transactionId})`,
          referenceId: transactionId,
        });

        const updatedProd = {
          ...prod,
          stock: newStock,
          updatedAt: nowIso,
        };

        // Sync product stock update to Firestore Cloud if authenticated
        if (auth.currentUser) {
          setDoc(doc(db, 'products', prod.id), { ...updatedProd, ownerId: currentUserId }).catch(() => {});
        }

        return updatedProd;
      }
      return prod;
    });

    setProducts(updatedProducts);
    setStockMovements(prev => [...newStockMovements, ...prev]);
    setTransactions(prev => [transaction, ...prev]);

    // Save transaction to Firestore Cloud if authenticated
    if (auth.currentUser) {
      setDoc(doc(db, 'transactions', transaction.id), {
        ...transaction,
        ownerId: currentUserId,
      }).catch(err => {
        console.warn('Could not sync transaction to cloud:', err);
      });
    }

    clearCart();
    soundEffects.playSuccessChime();

    return { success: true, transaction };
  };

  // REFUND: Restores stock automatically into inventory
  const refundTransaction = (transactionId: string, reason: string): { success: boolean; message?: string } => {
    const target = transactions.find(t => t.id === transactionId);
    if (!target) return { success: false, message: 'Transaksi tidak ditemukan' };
    if (target.status === 'refunded') return { success: false, message: 'Transaksi ini sudah pernah dibatalkan.' };

    const nowIso = new Date().toISOString();
    const refundMovements: StockMovement[] = [];
    const currentUserId = auth.currentUser?.uid || 'offline-user';

    const updatedProducts = products.map(prod => {
      const soldItem = target.items.find(i => i.productId === prod.id);
      if (soldItem) {
        const restoredStock = prod.stock + soldItem.quantity;
        refundMovements.push({
          id: `mov-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: nowIso,
          productId: prod.id,
          productName: prod.name,
          sku: prod.sku,
          type: 'refund',
          quantityDelta: soldItem.quantity,
          previousStock: prod.stock,
          currentStock: restoredStock,
          note: `Pembatalan/Refund (${transactionId}) - Alasan: ${reason}`,
          referenceId: transactionId,
        });

        const restoredProd = {
          ...prod,
          stock: restoredStock,
          updatedAt: nowIso,
        };

        if (auth.currentUser) {
          setDoc(doc(db, 'products', prod.id), { ...restoredProd, ownerId: currentUserId }).catch(() => {});
        }

        return restoredProd;
      }
      return prod;
    });

    setProducts(updatedProducts);
    setStockMovements(prev => [...refundMovements, ...prev]);

    const updatedTrxList = transactions.map(t =>
      t.id === transactionId
        ? {
            ...t,
            status: 'refunded' as const,
            refundReason: reason,
            refundedAt: nowIso,
          }
        : t
    );
    setTransactions(updatedTrxList);

    if (auth.currentUser) {
      setDoc(doc(db, 'transactions', transactionId), {
        ...target,
        status: 'refunded',
        refundReason: reason,
        refundedAt: nowIso,
        ownerId: currentUserId,
      }).catch(() => {});
    }

    return { success: true };
  };

  // Product Management
  const addProduct = (newProductData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `prod-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const currentUserId = auth.currentUser?.uid || 'offline-user';

    const newProd: Product = {
      ...newProductData,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setProducts(prev => [newProd, ...prev]);

    if (newProd.stock > 0) {
      setStockMovements(prev => [
        {
          id: `mov-${Date.now()}`,
          timestamp: nowIso,
          productId: id,
          productName: newProd.name,
          sku: newProd.sku,
          type: 'restock',
          quantityDelta: newProd.stock,
          previousStock: 0,
          currentStock: newProd.stock,
          note: 'Stok awal produk baru',
        },
        ...prev,
      ]);
    }

    if (auth.currentUser) {
      setDoc(doc(db, 'products', id), { ...newProd, ownerId: currentUserId }).catch(() => {});
    }
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const nowIso = new Date().toISOString();
    const currentUserId = auth.currentUser?.uid || 'offline-user';

    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields, updatedAt: nowIso };
          if (auth.currentUser) {
            setDoc(doc(db, 'products', id), { ...updated, ownerId: currentUserId }).catch(() => {});
          }
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));

    if (auth.currentUser) {
      deleteDoc(doc(db, 'products', id)).catch(() => {});
    }
  };

  const adjustStock = (
    productId: string,
    delta: number,
    type: 'restock' | 'adjustment',
    note: string
  ): { success: boolean; message?: string } => {
    const target = products.find(p => p.id === productId);
    if (!target) return { success: false, message: 'Produk tidak ditemukan' };

    const newStock = target.stock + delta;
    if (newStock < 0) {
      return { success: false, message: 'Hasil stok tidak boleh negatif.' };
    }

    const nowIso = new Date().toISOString();
    const currentUserId = auth.currentUser?.uid || 'offline-user';

    const updated = { ...target, stock: newStock, updatedAt: nowIso };

    setProducts(prev =>
      prev.map(p => (p.id === productId ? updated : p))
    );

    if (auth.currentUser) {
      setDoc(doc(db, 'products', productId), { ...updated, ownerId: currentUserId }).catch(() => {});
    }

    setStockMovements(prev => [
      {
        id: `mov-${Date.now()}`,
        timestamp: nowIso,
        productId: target.id,
        productName: target.name,
        sku: target.sku,
        type,
        quantityDelta: delta,
        previousStock: target.stock,
        currentStock: newStock,
        note: note || (type === 'restock' ? 'Restok barang masuk' : 'Penyesuaian stok fisik'),
      },
      ...prev,
    ]);

    return { success: true };
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    if (auth.currentUser) {
      setDoc(doc(db, 'stores', auth.currentUser.uid), {
        ...newSettings,
        ownerId: auth.currentUser.uid,
      }).catch(() => {});
    }
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setSettings(INITIAL_SETTINGS);
    setCart([]);
    setCartDiscount(0);
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_stock_movements`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
  };

  const exportDatabaseJson = () => {
    const data = {
      app: 'Kasir Hebat',
      exportedAt: new Date().toISOString(),
      products,
      transactions,
      stockMovements,
      settings,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kasir-hebat-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importDatabaseJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        return { success: false, message: 'Format file tidak valid (data produk hilang).' };
      }
      if (parsed.products) setProducts(parsed.products);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
      if (parsed.settings) setSettings(parsed.settings);
      setCart([]);
      return { success: true, message: 'Data cadangan berhasil dipulihkan!' };
    } catch {
      return { success: false, message: 'Gagal memproses file JSON. Format rusak.' };
    }
  };

  return (
    <PosContext.Provider
      value={{
        products,
        cart,
        transactions,
        stockMovements,
        settings,
        activeTab,
        setActiveTab,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotals,
        cartDiscount,
        setCartDiscount,
        cartTaxEnabled,
        setCartTaxEnabled,
        checkout,
        refundTransaction,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        updateSettings,
        resetToSampleData,
        exportDatabaseJson,
        importDatabaseJson,
        lowStockCount,
        currentUser,
        loginUser,
        logoutUser,
        isCloudConnected,
        isSyncing,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
