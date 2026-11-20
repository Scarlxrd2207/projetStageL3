import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  getDetailCommande,
  accepterCommande,
  refuserCommande,
} from '../../services/commande.service';
import type { DetailCommande } from '../../services/commande.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

const LIBELLES = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
} as const;

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.split('-');
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

  const [detail, setDetail] = useState<DetailCommande | null>(null);
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!id) return;
    getDetailCommande(id)
      .then((d) => {
        setDetail(d);
        // quantités proposées par défaut : la quantité demandée
        setSaisie(
          Object.fromEntries(d.lignes.map((l) => [l.idLigneCommande, String(l.quantiteDemandee)]))
        );
      })
      .catch(() => setErreur('Commande introuvable'));
  }, [id]);

  const peutTraiter = estPresident && detail?.commande.statutCommande === 'EN_ATTENTE';

  function lireQuantite(idLigne: string): number {
    return Number((saisie[idLigne] ?? '').replace(',', '.'));
  }

  // Contrôles faits avant envoi ; renvoie un message, ou null si tout est correct
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

    const probleme = verifierQuantites();
    if (probleme) {
      setErreur(probleme);
      return;
    }

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

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  };

  const champ = {
    width: 120,
    padding: 6,
    boxSizing: 'border-box' as const,
  };

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
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
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
            </section>

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
                    </tr>
                  ))}
                </tbody>
              </table>

              {erreur && <p style={{ color: '#ef4444', marginTop: 12 }}>{erreur}</p>}

              {peutTraiter && (
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button type="button" className="btn-primary" disabled={envoi} onClick={accepter}>
                    {envoi ? 'Traitement...' : 'Accepter la commande'}
                  </button>
                  <button
                    type="button"
                    disabled={envoi}
                    onClick={refuser}
                    style={{ ...boutonLien, color: '#ef4444' }}
                  >
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