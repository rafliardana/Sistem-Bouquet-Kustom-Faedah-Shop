/**
 * utils/format.ts
 * ------------------------------------------------------------------
 * Fungsi format yang hasilnya IDENTIK di Android & iOS.
 * Sengaja tidak memakai toLocaleString("id-ID") karena dukungan
 * locale Intl pada engine JS bisa berbeda antar perangkat.
 */

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

/** 150000 → "Rp 150.000" */
export function formatRupiah(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${rounded < 0 ? "-" : ""}Rp ${digits}`;
}

/** ISO timestamp → "25 Nov 2026" */
export function formatTanggal(isoString: string): string {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return isoString;
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}
