<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import BoutonFacture from '../../components/BoutonFacture';
=======
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import {
  getDetailCommande,
  accepterCommande,
  refuserCommande,
<<<<<<< HEAD
  changerStatutPaiement,
} from '../../services/commande.service';
import type { DetailCommande } from '../../services/commande.service';
import { lireSession } from '../../utils/session';
import { useMaj } from '../../hooks/useTempsReel';
import { formaterAr } from '../../utils/format';
=======
} from '../../services/commande.service';
import type { DetailCommande } from '../../services/commande.service';
import { lireSession } from '../../utils/session';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import '../../styles/dashboard.css';

const LIBELLES = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
} as const;

<<<<<<< HEAD
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
=======
// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.split('-');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number | null): string {
  return n === null ? '—' : `${n.toLocaleString('fr-FR')} kg`;
}

export default function DetailCommandePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = lireSession();
  const estPresident = session?.role === 'PRESIDENT';
<<<<<<< HEAD
  const estResponsable = session?.role === 'RESPONSABLE';

  const [detail, setDetail] = useState<DetailCommande | null>(null);
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [paiement, setPaiement] = useState<'PAYE' | 'NON_PAYE'>('NON_PAYE');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const charger = useCallback(() => {
=======

  const [detail, setDetail] = useState<DetailCommande | null>(null);
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    if (!id) return;
    getDetailCommande(id)
      .then((d) => {
        setDetail(d);
<<<<<<< HEAD
        setPaiement(d.commande.statutPaiement);
=======
        // quantités proposées par défaut : la quantité demandée
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        setSaisie(
          Object.fromEntries(d.lignes.map((l) => [l.idLigneCommande, String(l.quantiteDemandee)]))
        );
      })
      .catch(() => setErreur('Commande introuvable'));
  }, [id]);

<<<<<<< HEAD
  useEffect(() => {
    charger();
  }, [charger]);

  useMaj(charger);

  const peutTraiter = estPresident && detail?.commande.statutCommande === 'EN_ATTENTE';
  const peutPayer = estResponsable && detail !== null && detail.commande.statutCommande !== 'REFUSEE';

  function lireQuantite(idLigne: string): number {
    const valeur = Number((saisie[idLigne] ?? '').replace(',', '.'));
    return Number.isFinite(valeur) ? valeur : 0;
  }

  // Montant de chaque ligne : pendant la saisie, selon la quantité tapée ; sinon, celui du serveur
  function montantLigne(l: DetailCommande['lignes'][number]): number {
    return peutTraiter ? lireQuantite(l.idLigneCommande) * l.prixUnitaire : l.montantLigne;
  }

  const montantAffiche = detail
    ? peutTraiter
      ? detail.lignes.reduce((somme, l) => somme + montantLigne(l), 0)
      : detail.commande.montantTotal
    : 0;

  const libelleMontant = !detail
    ? ''
    : detail.commande.statutCommande === 'EN_ATTENTE'
      ? 'Montant estimé (quantités demandées)'
      : detail.commande.statutCommande === 'REFUSEE'
        ? 'Commande refusée : montant nul'
        : 'Montant confirmé';

=======
  const peutTraiter = estPresident && detail?.commande.statutCommande === 'EN_ATTENTE';

  function lireQuantite(idLigne: string): number {
    return Number((saisie[idLigne] ?? '').replace(',', '.'));
  }

  // Contrôles faits avant envoi ; renvoie un message, ou null si tout est correct
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  function verifierQuantites(): string | null {
    if (!detail) return 'Commande introuvable';
    for (const l of detail.lignes) {
      const q = lireQuantite(l.idLigneCommande);
      if (!(q > 0)) return `Quantité invalide pour ${l.nomProduit}`;
      if (q > l.quantiteDemandee) return `Quantité supérieure à la demande pour ${l.nomProduit}`;
      if (q > l.quantiteRestanteRecolte) {
        return `Récolte insuffisante pour ${l.nomProduit} (${l.quantiteRestanteRecolte} kg disponibles)`;
      }
    }
    return null;
  }

  async function accepter() {
    if (!detail || !session) return;
<<<<<<< HEAD
=======

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    const probleme = verifierQuantites();
    if (probleme) {
      setErreur(probleme);
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    setErreur('');
    setEnvoi(true);
    try {
      await accepterCommande(
        detail.commande.idCommande,
        session.idUser,
        detail.lignes.map((l) => ({
          idLigneCommande: l.idLigneCommande,
          quantiteConfirmee: lireQuantite(l.idLigneCommande),
        }))
      );
      navigate('/commandes');
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Acceptation impossible');
      setEnvoi(false);
    }
  }

  async function refuser() {
    if (!detail || !session) return;
    if (!window.confirm('Refuser cette commande ? Aucun stock ne sera modifié.')) return;
<<<<<<< HEAD
=======

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    setErreur('');
    setEnvoi(true);
    try {
      await refuserCommande(detail.commande.idCommande, session.idUser);
      navigate('/commandes');
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Refus impossible');
      setEnvoi(false);
    }
  }

<<<<<<< HEAD
  async function enregistrerPaiement() {
    if (!detail || !session) return;
    setErreur('');
    setMessage('');
    setEnvoi(true);
    try {
      await changerStatutPaiement(detail.commande.idCommande, session.idUser, paiement);
      setMessage('Statut de paiement enregistré');
      charger();
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Mise à jour impossible');
    } finally {
      setEnvoi(false);
    }
  }

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  };

<<<<<<< HEAD
  const champ = { width: 120, padding: 6, boxSizing: 'border-box' as const };
=======
  const champ = {
    width: 120,
    padding: 6,
    boxSizing: 'border-box' as const,
  };
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>{detail ? `Commande du ${formaterDate(detail.commande.dateCommande)}` : 'Commande'}</h1>
          <button type="button" style={boutonLien} onClick={() => navigate('/commandes')}>
            Retour
          </button>
        </header>

        {erreur && !detail && (
<<<<<<< HEAD
          <section className="card"><p style={{ color: '#ef4444' }}>{erreur}</p></section>
=======
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        )}

        {detail && (
          <>
            <section className="card">
              <p>
                <strong>Coopérative :</strong> {detail.commande.nomCoop} ·{' '}
                <strong>Statut :</strong> {LIBELLES[detail.commande.statutCommande]} ·{' '}
                <strong>Paiement :</strong>{' '}
                {detail.commande.statutPaiement === 'PAYE' ? 'Payé' : 'Non payé'}
              </p>
              <p>
                <strong>Acceptée le :</strong> {formaterDate(detail.commande.dateAcceptation)} ·{' '}
                <strong>Livrée le :</strong> {formaterDate(detail.commande.dateLivraison)}
              </p>
<<<<<<< HEAD
              <p style={{ fontSize: 18 }}>
                <strong>Montant total :</strong> {formaterAr(montantAffiche)}
                <span style={{ fontSize: 13, color: 'var(--texte-doux)', marginLeft: 10 }}>{libelleMontant}</span>
              </p>

              <BoutonFacture
                idCommande={detail.commande.idCommande}
                statut={detail.commande.statutCommande}
              />
            </section>

            {peutPayer && (
              <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <strong>Statut de paiement :</strong>
                <select
                  value={paiement}
                  onChange={(e) => setPaiement(e.target.value as 'PAYE' | 'NON_PAYE')}
                  style={{ padding: 8 }}
                >
                  <option value="NON_PAYE">Non payé</option>
                  <option value="PAYE">Payé</option>
                </select>
                <button type="button" className="btn-primary" disabled={envoi} onClick={enregistrerPaiement}>
                  Enregistrer le paiement
                </button>
                {message && <span style={{ color: 'var(--accent)' }}>{message}</span>}
              </section>
            )}

=======
            </section>

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
            <section className="card">
              <h3>Lignes de la commande</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Membre producteur</th>
                    <th>Lieu</th>
                    <th>Date de récolte</th>
                    <th>Demandée</th>
                    <th>Disponible</th>
                    <th>Confirmée</th>
<<<<<<< HEAD
                    <th>Prix (Ar/kg)</th>
                    <th>Montant</th>
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                  </tr>
                </thead>
                <tbody>
                  {detail.lignes.map((l) => (
                    <tr key={l.idLigneCommande}>
                      <td>{l.nomProduit}</td>
                      <td>{l.prenomMembre} {l.nomMembre}</td>
                      <td>{l.districtMembre} · {l.communeMembre} · {l.fokotanyMembre}</td>
                      <td>{formaterDate(l.dateRecolte)}</td>
                      <td>{formaterKg(l.quantiteDemandee)}</td>
                      <td>{formaterKg(l.quantiteRestanteRecolte)}</td>
                      <td>
                        {peutTraiter ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={saisie[l.idLigneCommande] ?? ''}
                            onChange={(e) =>
                              setSaisie((s) => ({ ...s, [l.idLigneCommande]: e.target.value }))
                            }
                            style={champ}
                          />
                        ) : (
                          formaterKg(l.quantiteConfirmee)
                        )}
                      </td>
<<<<<<< HEAD
                      <td>{formaterAr(l.prixUnitaire)}</td>
                      <td><strong>{formaterAr(montantLigne(l))}</strong></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'right', fontWeight: 600 }}>Total</td>
                    <td style={{ fontWeight: 700 }}>{formaterAr(montantAffiche)}</td>
                  </tr>
                </tfoot>
=======
                    </tr>
                  ))}
                </tbody>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
              </table>

              {erreur && <p style={{ color: '#ef4444', marginTop: 12 }}>{erreur}</p>}

              {peutTraiter && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn-primary" disabled={envoi} onClick={accepter}>
                    {envoi ? 'Traitement...' : 'Accepter la commande'}
                  </button>
<<<<<<< HEAD
                  <button type="button" disabled={envoi} onClick={refuser} style={{ ...boutonLien, color: '#ef4444' }}>
=======
                  <button
                    type="button"
                    disabled={envoi}
                    onClick={refuser}
                    style={{ ...boutonLien, color: '#ef4444' }}
                  >
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                    Refuser
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}