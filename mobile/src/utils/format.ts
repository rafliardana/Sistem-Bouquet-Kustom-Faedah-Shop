// Fungsi format tampilan: mata uang Rupiah dan tanggal berbahasa Indonesia.
// Intl tidak selalu lengkap di Hermes (Android), jadi Rupiah diformat manual.
export function formatRupiah(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${rounded < 0 ? "-" : ""}Rp ${digits}`;
}

const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export function formatTanggal(iso: string, withTime = false): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const tanggal = `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  if (!withTime) return tanggal;
  const jam = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${tanggal}, ${jam}`;
}
