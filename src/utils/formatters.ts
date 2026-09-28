/**
 * Format angka ke mata uang Rupiah (IDR)
 */
export function formatRupiah(value: number): string {
  if (isNaN(value)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format tanggal Indonesia (contoh: 26 Sep 2026, 15:30)
 */
export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format tanggal saja (contoh: 26 September 2026)
 */
export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

/**
 * Format jam saja (contoh: 14:35 WIB)
 */
export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d) + ' WIB';
  } catch {
    return isoString;
  }
}

/**
 * Generator ID Transaksi unik berurutan harian
 * Contoh: TRX-20260926-8492
 */
export function generateTransactionId(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRX-${year}${month}${day}-${rand}`;
}

/**
 * Generator SKU otomatis
 */
export function generateSKU(category: string, name: string): string {
  const catPrefix = category.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'GEN');
  const namePrefix = name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'ITM');
  const rand = Math.floor(100 + Math.random() * 900);
  return `${catPrefix}-${namePrefix}-${rand}`;
}

/**
 * Export data array ke file CSV dan download di browser
 */
export function exportToCSV(filename: string, rows: Record<string, string | number>[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(field => {
        const val = row[field] ?? '';
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
