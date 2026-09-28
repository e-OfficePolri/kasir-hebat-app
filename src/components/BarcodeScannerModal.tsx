import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import {
  X,
  Camera,
  RotateCcw,
  Zap,
  ZapOff,
  AlertTriangle,
  Keyboard,
  Barcode,
  Search,
} from 'lucide-react';
import { soundEffects } from '../utils/soundEffects';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcodeOrSku: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
}) => {
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-barcode-reader';
  const lastScannedTimeRef = useRef<number>(0);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      scannerRef.current = null;
      setIsScanning(false);
    }
  }, []);

  const handleScanSuccess = useCallback((decodedText: string) => {
    const now = Date.now();
    // Debounce scans by 1.2s to prevent multiple triggers for the same barcode
    if (now - lastScannedTimeRef.current < 1200) {
      return;
    }
    lastScannedTimeRef.current = now;

    soundEffects.playScanBeep();
    onScan(decodedText.trim());
    stopScanner().then(() => {
      onClose();
    });
  }, [onScan, onClose, stopScanner]);

  const startScanner = useCallback(async () => {
    setCameraError(null);
    await stopScanner();

    // Check if DOM container exists
    const container = document.getElementById(scannerContainerId);
    if (!container) return;

    try {
      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.DATA_MATRIX,
        ],
        verbose: false,
      });

      scannerRef.current = html5QrCode;

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const qrboxSize = Math.floor(minEdge * 0.72);
          return {
            width: qrboxSize,
            height: Math.floor(qrboxSize * 0.7),
          };
        },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: facingMode },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        () => {
          // Frame scan error (normal when no barcode in frame)
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('Camera scan start error:', msg);
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setCameraError('Izin akses kamera ditolak. Mohon aktifkan izin kamera di pengaturan browser.');
      } else if (msg.includes('NotFoundError') || msg.includes('DevicesNotFoundError')) {
        setCameraError('Kamera tidak ditemukan pada perangkat ini.');
      } else {
        setCameraError('Tidak dapat membuka kamera. Anda dapat mengetik kode barcode di bawah.');
      }
      setIsScanning(false);
    }
  }, [facingMode, handleScanSuccess, stopScanner]);

  useEffect(() => {
    if (isOpen) {
      // Small timeout to let modal render into DOM
      const timer = setTimeout(() => {
        startScanner();
      }, 250);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    } else {
      stopScanner();
    }
  }, [isOpen, startScanner, stopScanner]);

  const toggleCameraFacing = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    soundEffects.playScanBeep();
    onScan(manualInput.trim());
    stopScanner();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Scanner Barcode Kamera</h3>
              <p className="text-xs text-neutral-400">Arahkan kamera ke barcode kemasan barang</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Scanner */}
        <div className="relative bg-black flex-1 min-h-[300px] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center space-y-3 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-neutral-200">{cameraError}</p>
              <button
                type="button"
                onClick={startScanner}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl"
              >
                Coba Buka Kamera Lagi
              </button>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <div id={scannerContainerId} className="w-full max-w-sm overflow-hidden" />
              
              {/* Scan target overlay border */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  <div className="w-64 h-48 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400 -mt-1 -ml-1 rounded-tl-sm" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400 -mt-1 -mr-1 rounded-tr-sm" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400 -mb-1 -ml-1 rounded-bl-sm" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400 -mb-1 -mr-1 rounded-br-sm" />
                    
                    {/* Laser scanning line animation */}
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse" />
                  </div>
                  <span className="mt-4 text-xs font-medium text-emerald-300/90 bg-neutral-900/80 px-3 py-1 rounded-full border border-neutral-700 backdrop-blur-sm">
                    Posisikan barcode di dalam kotak
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Camera controls toolbar */}
          {!cameraError && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3 px-4 pointer-events-auto">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/80 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 rounded-xl border border-neutral-700/80 backdrop-blur-md shadow-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{facingMode === 'environment' ? 'Kamera Belakang' : 'Kamera Depan'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Manual SKU / Barcode input fallback */}
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" /> Atau ketik manual barcode / SKU
            </span>
          </div>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Contoh: 899123456001 atau SMB-BRS-101"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-700 rounded-xl text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cari</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
