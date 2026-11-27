// Montant en Ariary : 1500 devient "1 500 Ar"
export function formaterAr(n: number | null | undefined): string {
  const valeur = Number.isFinite(n) ? (n as number) : 0;
  return `${valeur.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Ar`;
}