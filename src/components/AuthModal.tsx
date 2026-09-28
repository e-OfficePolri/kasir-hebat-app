import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Store,
  Phone,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, initialMode, onClose }) => {
  const { settings, setActiveTab, loginUser } = usePos();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(settings.activeCashierName || '');
  const [storeName, setStoreName] = useState(settings.storeName || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync mode when prop changes
  React.useEffect(() => {
    setMode(initialMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Mohon lengkapi email dan password Anda.');
      return;
    }

    if (mode === 'register') {
      if (!fullName || !storeName) {
        setErrorMessage('Mohon isi nama lengkap dan nama toko Anda.');
        return;
      }

      // Log in and set registered profile
      loginUser({
        name: fullName.trim(),
        email: email.trim(),
        storeName: storeName.trim(),
        phone: phone.trim() || undefined,
        role: 'owner',
      });

      setSuccessMessage('Pendaftaran Berhasil! Toko dan akun kasir Anda telah diatur.');
    } else {
      // Login mode
      let cashierName = settings.activeCashierName || 'Kasir 1';
      if (email.includes('@')) {
        const usernamePart = email.split('@')[0];
        cashierName = usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1);
      }

      loginUser({
        name: cashierName,
        email: email.trim(),
        storeName: settings.storeName || 'Kasir Hebat Store',
        role: 'cashier',
      });

      setSuccessMessage('Berhasil Masuk! Selamat bertugas.');
    }

    // Auto close and route to POS after short delay
    setTimeout(() => {
      onClose();
      setActiveTab('pos');
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-6">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              {mode === 'login' ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {mode === 'login' ? 'Masuk ke Kasir Hebat' : 'Daftar Akun Toko Baru'}
              </h3>
              <p className="text-xs text-neutral-400">
                {mode === 'login'
                  ? 'Gunakan akun kasir Anda untuk bertransaksi'
                  : 'Mulai kelola kasir dan stok tokomu sekarang'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-950 border-b border-neutral-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-emerald-500 text-neutral-950 font-bold shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Daftar (Register)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {mode === 'register' && (
            <>
              {/* Nama Lengkap Kasir / Pemilik */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Nama Lengkap Kasir / Pemilik
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Nama Toko / Usaha */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Nama Toko / Usaha Retail
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="Contoh: Toko Maju Jaya"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Nomor Telepon / WA */}
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Nomor HP / WhatsApp Toko
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email Address */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-9 pr-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-neutral-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-neutral-500 hover:text-neutral-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk Sekarang</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Daftar Toko &amp; Mulai Jualan</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 text-center text-xs text-neutral-500">
          {mode === 'login' ? (
            <p>
              Belum punya akun kasir?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Daftar Gratis di sini
              </button>
            </p>
          ) : (
            <p>
              Sudah memiliki akun kasir?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
