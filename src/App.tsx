/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Navbar } from './components/Navbar';
import { HomeView } from './components/HomeView';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { GithubGuideModal } from './components/GithubGuideModal';
import { AuthModal } from './components/AuthModal';
import { Transaction } from './types/pos';

function MainLayout() {
  const { activeTab, setActiveTab, cart, currentUser } = usePos();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<Transaction | null>(null);
  const [isGithubGuideOpen, setIsGithubGuideOpen] = useState(false);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'login' | 'register' }>({
    isOpen: false,
    mode: 'login',
  });

  // Guard: If not logged in, enforce activeTab to always stay on 'home'
  useEffect(() => {
    if (!currentUser && activeTab !== 'home') {
      setActiveTab('home');
    }
  }, [currentUser, activeTab, setActiveTab]);

  // Keyboard shortcut listener (e.g. F8 for checkout) only when logged in
  useEffect(() => {
    if (!currentUser) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8' && cart.length > 0 && !isCheckoutOpen && !currentReceipt) {
        e.preventDefault();
        setIsCheckoutOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isCheckoutOpen, currentReceipt, currentUser]);

  const handleCheckoutSuccess = (trx: Transaction) => {
    setIsCheckoutOpen(false);
    setCurrentReceipt(trx);
  };

  const handleReprintReceipt = (trx: Transaction) => {
    setCurrentReceipt(trx);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar with Home, Navigation, Masuk & Daftar */}
      <Navbar
        onOpenGithubGuide={() => setIsGithubGuideOpen(true)}
        onOpenLogin={() => setAuthModal({ isOpen: true, mode: 'login' })}
        onOpenRegister={() => setAuthModal({ isOpen: true, mode: 'register' })}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 pb-12">
        {/* If user is not logged in, always render HomeView */}
        {!currentUser || activeTab === 'home' ? (
          <HomeView
            onOpenLogin={() => setAuthModal({ isOpen: true, mode: 'login' })}
            onOpenRegister={() => setAuthModal({ isOpen: true, mode: 'register' })}
          />
        ) : (
          <>
            {activeTab === 'pos' && (
              <PosView onOpenCheckout={() => setIsCheckoutOpen(true)} />
            )}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'transactions' && (
              <TransactionsView onReprintReceipt={handleReprintReceipt} />
            )}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'settings' && (
              <SettingsView onOpenGithubGuide={() => setIsGithubGuideOpen(true)} />
            )}
          </>
        )}
      </main>

      {/* Checkout Modal (only applicable when logged in) */}
      {currentUser && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Receipt Thermal Modal */}
      {currentUser && (
        <ReceiptModal
          transaction={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
        />
      )}

      {/* GitHub Guide Modal */}
      <GithubGuideModal
        isOpen={isGithubGuideOpen}
        onClose={() => setIsGithubGuideOpen(false)}
      />

      {/* Auth Modal (Masuk / Login & Daftar / Register) */}
      <AuthModal
        isOpen={authModal.isOpen}
        initialMode={authModal.mode}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}

export default function App() {
  return (
    <PosProvider>
      <MainLayout />
    </PosProvider>
  );
}
