// Repères "déjà vu" par utilisateur : mémorisés dans le navigateur.
export type Vus = Record<string, number>;

function cle(idUser: string): string {
  return `vu-${idUser}`;
}

export function lireVus(idUser: string): Vus {
  try {
    const valeur = JSON.parse(localStorage.getItem(cle(idUser)) ?? '{}');
    return valeur && typeof valeur === 'object' ? (valeur as Vus) : {};
  } catch {
    return {};
  }
}

export function ecrireVus(idUser: string, vus: Vus): void {
  localStorage.setItem(cle(idUser), JSON.stringify(vus));
}