import { exigerResponsable } from '../utils/acces';
import { transformerStockSoam } from '../repositories/transformation.repository';
import { notifierResponsables } from '../realtime';
import { SEUIL_STOCK_BAS_KG } from '../utils/stock';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const QUANTITE_MAX = 1000000;

// Sortie de stock pour transformation : responsable SOAM uniquement
export async function transformer(
  idUser: string,
  d: Record<string, unknown>
): Promise<Resultat<{ restant: number }>> {
  const a = await exigerResponsable(idUser);
  if (!a.ok) return a;

  const idProduit = typeof d.idProduit === 'string' ? d.idProduit.trim() : '';
  if (!idProduit) return { ok: false, status: 400, message: 'Produit obligatoire' };

  const quantite = Number(String(d.quantite ?? '').trim().replace(',', '.'));
  if (!Number.isFinite(quantite) || quantite <= 0) {
    return { ok: false, status: 400, message: 'La quantité doit être supérieure à 0' };
  }
  if (quantite > QUANTITE_MAX) {
    return { ok: false, status: 400, message: 'Quantité trop élevée' };
  }

  const r = await transformerStockSoam({ idProduit, quantite });
  if (!r.ok) return { ok: false, status: r.status, message: r.message };

  // Alerte temps réel envoyée au responsable quand le stock est au seuil ou en dessous
  if (r.restant <= SEUIL_STOCK_BAS_KG) {
    notifierResponsables({
      type: 'stock',
      message: `Stock central bas : ${r.nomProduit}, ${r.restant} kg restants (seuil ${SEUIL_STOCK_BAS_KG} kg)`,
    });
  }

  return { ok: true, status: 200, data: { restant: r.restant } };
}