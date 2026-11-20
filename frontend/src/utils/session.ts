export type Session = {
  idUser: string;
  email: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
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
  } catch {
    return null;
  }
}

// Supprime la session incomplète, pour forcer une nouvelle connexion
export function effacerSession(): void {
  localStorage.removeItem('utilisateur');
}