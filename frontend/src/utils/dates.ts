// Date du jour au format AAAA-MM-JJ (utilisé par les champs de date)
export function dateAujourdhui(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}