import { exigerResponsable } from '../utils/acces';
import * as repo from '../repositories/dashboardResponsable.repository';

export type DonneesResponsable = {
  indicateurs: repo.IndicateursResponsable;
  commandesParMois: { cle: string; libelle: string; nb: number }[];
  stockParProduit: repo.StockProduit[];
  dernieresCommandes: repo.CommandeResume[];
};

export type ResultatResponsable =
  | { ok: true; status: number; data: DonneesResponsable }
  | { ok: false; status: number; message: string };

const MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export async function responsableDashboard(idUser: string): Promise<ResultatResponsable> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const [ind, parMois, stock, dernieres] = await Promise.all([
    repo.indicateurs(),
    repo.commandesParMois(),
    repo.stockParProduit(),
    repo.dernieresCommandes(),
  ]);

  // Les six derniers mois, même ceux sans commande (valeur 0)
  const maintenant = new Date();
  const mois = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - (5 - k), 1);
    const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { cle, libelle: MOIS[d.getMonth()], nb: parMois.find((p) => p.mois === cle)?.nb ?? 0 };
  });

  return {
    ok: true,
    status: 200,
    data: { indicateurs: ind, commandesParMois: mois, stockParProduit: stock, dernieresCommandes: dernieres },
  };
}