// Seuil d'alerte du stock central SOAM, en kilogrammes.
// Doit rester identique à backend/src/utils/stock.ts.
export const SEUIL_STOCK_BAS_KG = 20;

// Vrai si la quantité est au seuil ou en dessous
export function stockBas(quantite: number): boolean {
  return Number(quantite) <= SEUIL_STOCK_BAS_KG;
}