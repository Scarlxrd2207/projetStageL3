// Texte sans accents ni majuscules : "ialamarina" trouve "Ialamarina"
export function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

// Vrai si la recherche figure dans au moins une des valeurs
export function contient(
  recherche: string,
  valeurs: Array<string | number | null | undefined>
): boolean {
  const q = normaliser(recherche);
  if (!q) return true;
  return valeurs.some(
    (v) => v !== null && v !== undefined && normaliser(String(v)).includes(q)
  );
}

// Vrai si la date (AAAA-MM-JJ ou datetime) est comprise entre "du" et "au"
export function dansPeriode(iso: string | null | undefined, du: string, au: string): boolean {
  if (!du && !au) return true;
  if (!iso) return false;
  const jour = iso.slice(0, 10);
  if (du && jour < du) return false;
  if (au && jour > au) return false;
  return true;
}