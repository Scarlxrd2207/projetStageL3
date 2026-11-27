export type Session = {
  idUser: string;
  email: string;
  role: 'RESPONSABLE' | 'PRESIDENT';
  idCoop: string | null;
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
  } catch {
    return null;
  }
}

export function effacerSession(): void {
  sessionStorage.removeItem(CLE);
}