import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { TRADUCTIONS } from '../i18n/traductions';
import type { Langue } from '../i18n/traductions';

type LangueContextType = {
  langue: Langue;
  setLangue: (l: Langue) => void;
  t: (cle: string) => string;
};

const LangueContext = createContext<LangueContextType | undefined>(undefined);

function langueInitiale(): Langue {
  const valeur = localStorage.getItem('langue');
  return valeur === 'mg' || valeur === 'fr' ? valeur : 'fr';
}

export function LangueProvider({ children }: { children: ReactNode }) {
  const [langue, setLangueState] = useState<Langue>(langueInitiale);

  useEffect(() => {
    localStorage.setItem('langue', langue);
    document.documentElement.lang = langue;
  }, [langue]);

  const setLangue = useCallback((l: Langue) => setLangueState(l), []);

  // Clé absente du dictionnaire : on tente le français, puis on affiche la clé
  const t = useCallback(
    (cle: string) => TRADUCTIONS[langue][cle] ?? TRADUCTIONS.fr[cle] ?? cle,
    [langue]
  );

  return (
    <LangueContext.Provider value={{ langue, setLangue, t }}>
      {children}
    </LangueContext.Provider>
  );
}

export function useLangue(): LangueContextType {
  const ctx = useContext(LangueContext);
  if (!ctx) throw new Error('useLangue doit être utilisé dans LangueProvider');
  return ctx;
}