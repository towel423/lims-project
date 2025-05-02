export const ensurePrefix = (str: string, prefix: string) =>
  str.startsWith(prefix) ? str : `${prefix}${str}`;
export const withoutSuffix = (str: string, suffix: string) =>
  str.endsWith(suffix) ? str.slice(0, -suffix.length) : str;
export const withoutPrefix = (str: string, prefix: string) =>
  str.startsWith(prefix) ? str.slice(prefix.length) : str;
export function textToSlug(text: string): string {
  return text
    .toLowerCase() // Mengubah huruf menjadi huruf kecil
    .trim() // Menghilangkan spasi di awal dan akhir teks
    .replace(/[\s]+/g, "-") // Mengganti spasi dengan tanda strip
    .replace(/[^\w\-]+/g, "") // Menghapus karakter selain huruf, angka, dan strip
    .replace(/\-\-+/g, "-") // Mengganti tanda strip ganda atau lebih menjadi satu strip
    .replace(/^-+/, "") // Menghapus tanda strip di awal string
    .replace(/-+$/, ""); // Menghapus tanda strip di akhir string
}
export function slugToNormalText(slug: string = "") {
  return slug
    .split("-") // Memisahkan slug berdasarkan tanda "-"
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)) // Membuat huruf pertama dari setiap kata menjadi kapital
    .join(" "); // Menggabungkan kembali dengan spasi
}

