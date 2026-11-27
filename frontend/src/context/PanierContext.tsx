import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

// Une ligne = une récolte, avec la quantité demandée
export type LignePanier = {
  idRecolte: string;
  idCoop: string;
  nomCoop: string;
  idProduit: string;
  nomProduit: string;
  nomMembre: string;
  prenomMembre: string;
  dateRecolte: string;
  quantiteDisponible: number;
  quantite: number;
};

export type DonneesAjout = Omit<LignePanier, 'quantite'>;

type ContextePanier = {
  lignes: LignePanier[];
  nombre: number;
  ajouter: (l: DonneesAjout, quantite: number) => void;
  modifier: (idRecolte: string, quantite: number) => void;
  retirer: (idRecolte: string) => void;
  retirerCoop: (idCoop: string) => void;
  vider: () => void;
};

const CLE = 'panier';
const Contexte = createContext<ContextePanier | undefined>(undefined);

function lireStockage(): LignePanier[] {
  try {
    const valeur = JSON.parse(sessionStorage.getItem(CLE) ?? '[]');
    return Array.isArray(valeur) ? valeur : [];
  } catch {
    return [];
  }
}

// La quantité ne dépasse jamais ce qui reste sur la récolte
function borner(q: number, max: number): number {
  return Math.min(Math.max(q, 0), max);
}

export function PanierProvider({ children }: { children: ReactNode }) {
  const [lignes, setLignes] = useState<LignePanier[]>(lireStockage);

  // Le panier est gardé dans l'onglet : il survit à un rechargement de page
  useEffect(() => {
    sessionStorage.setItem(CLE, JSON.stringify(lignes));
  }, [lignes]);

  const ajouter = useCallback((l: DonneesAjout, quantite: number) => {
    setLignes((prev) => {
      const existante = prev.find((x) => x.idRecolte === l.idRecolte);
      if (existante) {
        return prev.map((x) =>
          x.idRecolte === l.idRecolte
            ? {
                ...x,
                quantiteDisponible: l.quantiteDisponible,
                quantite: borner(x.quantite + quantite, l.quantiteDisponible),
              }
            : x
        );
      }
      return [...prev, { ...l, quantite: borner(quantite, l.quantiteDisponible) }];
    });
  }, []);

  const modifier = useCallback((idRecolte: string, quantite: number) => {
    setLignes((prev) =>
      prev.map((x) =>
        x.idRecolte === idRecolte ? { ...x, quantite: borner(quantite, x.quantiteDisponible) } : x
      )
    );
  }, []);

  const retirer = useCallback((idRecolte: string) => {
    setLignes((prev) => prev.filter((x) => x.idRecolte !== idRecolte));
  }, []);

  const retirerCoop = useCallback((idCoop: string) => {
    setLignes((prev) => prev.filter((x) => x.idCoop !== idCoop));
  }, []);

  const vider = useCallback(() => setLignes([]), []);

  const valeur = useMemo(
    () => ({ lignes, nombre: lignes.length, ajouter, modifier, retirer, retirerCoop, vider }),
    [lignes, ajouter, modifier, retirer, retirerCoop, vider]
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function usePanier(): ContextePanier {
  const ctx = useContext(Contexte);
  if (!ctx) throw new Error('usePanier doit être utilisé dans PanierProvider');
  return ctx;
}