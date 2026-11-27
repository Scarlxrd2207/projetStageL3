import { exigerUtilisateur } from '../utils/acces';
import * as repo from '../repositories/statistiques.repository';

export type Resultat<T = unknown> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NOMS_MOIS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function lirePeriode(du: unknown, au: unknown): { periode?: repo.Periode; erreur?: string } {
  const d = typeof du === 'string' && du !== '' ? du : null;
  const a = typeof au === 'string' && au !== '' ? au : null;
  if ((d && !DATE_RE.test(d)) || (a && !DATE_RE.test(a))) return { erreur: 'Date invalide (AAAA-MM-JJ)' };
  if (d && a && d > a) return { erreur: 'La date de début doit précéder la date de fin' };
  return { periode: { du: d, au: a } };
}

// Ajoute des mois à une paire [année, mois]
function ajouterMois(an: number, mois: number, delta: number): [number, number] {
  const d = new Date(an, mois - 1 + delta, 1);
  return [d.getFullYear(), d.getMonth() + 1];
}

// Liste des mois AAAA-MM couverts : la période, ou les 12 derniers mois sans filtre
function moisDeLaPeriode(p: repo.Periode): string[] {
  const aujourdhui = new Date();
  const [anAujourdhui, moisAujourdhui] = [aujourdhui.getFullYear(), aujourdhui.getMonth() + 1];

  const [debutAn, debutMois] = p.du
    ? p.du.split('-').map(Number) as [number, number]
    : ajouterMois(anAujourdhui, moisAujourdhui, -11);
  const [finAn, finMois] = p.au
    ? p.au.split('-').map(Number) as [number, number]
    : [anAujourdhui, moisAujourdhui];

  const mois: string[] = [];
  let [an, m] = [debutAn, debutMois];
  while ((an < finAn || (an === finAn && m <= finMois)) && mois.length < 120) {
    mois.push(`${an}-${String(m).padStart(2, '0')}`);
    [an, m] = ajouterMois(an, m, 1);
  }
  return mois;
}

function libelleMois(cle: string): string {
  const [an, m] = cle.split('-');
  return `${NOMS_MOIS[Number(m) - 1]} ${an.slice(2)}`;
}

// Président : sa coopérative uniquement. Responsable : toutes les coopératives.
export async function tableau(idUser: string, du: unknown, au: unknown): Promise<Resultat> {
  const s = await exigerUtilisateur(idUser);
  if (!s.ok) return s;

  if (s.role === 'PRESIDENT' && !s.idCoop) {
    return { ok: false, status: 403, message: 'Aucune coopérative rattachée à ce compte' };
  }

  const p = lirePeriode(du, au);
  if (!p.periode) return { ok: false, status: 400, message: p.erreur ?? 'Période invalide' };

  const idCoop = s.role === 'PRESIDENT' ? s.idCoop : null;

  const [kpis, coops, mois] = await Promise.all([
    repo.kpis(idCoop, p.periode),
    repo.parCoop(idCoop, p.periode),
    repo.parMois(idCoop, p.periode),
  ]);

  const parMoisComplet = moisDeLaPeriode(p.periode).map((cle) => ({
    mois: cle,
    libelle: libelleMois(cle),
    quantiteLivree: mois.find((x) => x.mois === cle)?.quantiteLivree ?? 0,
  }));

  return {
    ok: true,
    status: 200,
    data: {
      role: s.role,
      periode: p.periode,
      kpis,
      parCoop: coops,
      parMois: parMoisComplet,
    },
  };
}