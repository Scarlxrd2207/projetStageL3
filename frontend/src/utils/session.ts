export type Session = {
  idUser: string;
  email: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
<<<<<<< HEAD
  nomCoop: string | null;
};

const CLE = 'utilisateur';

// sessionStorage : propre à chaque onglet
export function enregistrerSession(s: Session): void {
  sessionStorage.setItem(CLE, JSON.stringify(s));
}

export function lireSession(): Session | null {
  try {
    const brut = sessionStorage.getItem(CLE);
    if (!brut) return null;
    const s = JSON.parse(brut);
    if (!s || typeof s.idUser !== 'string' || s.idUser === '') return null;
    return { ...s, nomCoop: s.nomCoop ?? null } as Session;
=======
};

// Lit la session connectée. Renvoie null si elle est absente, illisible ou incomplète.
export function lireSession(): Session | null {
  try {
    const brut = localStorage.getItem('utilisateur');
    if (!brut) return null;

    const session = JSON.parse(brut);
    if (!session || typeof session.idUser !== 'string' || session.idUser === '') {
      return null;
    }
    return session as Session;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  } catch {
    return null;
  }
}

<<<<<<< HEAD
export function effacerSession(): void {
  sessionStorage.removeItem(CLE);
=======
// Supprime la session incomplète, pour forcer une nouvelle connexion
export function effacerSession(): void {
  localStorage.removeItem('utilisateur');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
}