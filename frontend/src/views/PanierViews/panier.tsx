import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBasket, Send, Trash2, ArrowLeft } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { usePanier } from '../../context/PanierContext';
import type { LignePanier } from '../../context/PanierContext';
import { creerCommande } from '../../services/commande.service';
import '../../styles/dashboard.css';

function kg(n: number): string {
  return `${Number(n).toLocaleString('fr-FR')} kg`;
}

// "2026-11-18" devient "18/11/2026"
function dateFr(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function nombre(valeur: string): number {
  return Number(valeur.replace(',', '.'));
}

type Groupe = { idCoop: string; nomCoop: string; lignes: LignePanier[] };

export default function PanierPage() {
  const navigate = useNavigate();
  const { lignes, modifier, retirer, retirerCoop, vider } = usePanier();

  const [envoi, setEnvoi] = useState<string | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');

  // Regroupement par coopérative : une commande par coopérative
  const groupes = useMemo<Groupe[]>(() => {
    const carte = new Map<string, Groupe>();
    for (const l of lignes) {
      const g = carte.get(l.idCoop) ?? { idCoop: l.idCoop, nomCoop: l.nomCoop, lignes: [] };
      g.lignes.push(l);
      carte.set(l.idCoop, g);
    }
    return [...carte.values()];
  }, [lignes]);

  const totalKg = lignes.reduce((somme, l) => somme + l.quantite, 0);

  function verifier(g: Groupe): string | null {
    for (const l of g.lignes) {
      if (!(l.quantite > 0)) return `Quantité invalide pour ${l.nomProduit}`;
      if (l.quantite > l.quantiteDisponible) {
        return `Quantité trop élevée pour ${l.nomProduit} : ${kg(l.quantiteDisponible)} disponibles`;
      }
    }
    return null;
  }

  // Valide une coopérative. Renvoie vrai si la commande est enregistrée.
  async function validerGroupe(g: Groupe): Promise<boolean> {
    const probleme = verifier(g);
    if (probleme) {
      setErreurs((e) => ({ ...e, [g.idCoop]: probleme }));
      return false;
    }

    setEnvoi(g.idCoop);
    setErreurs((e) => {
      const copie = { ...e };
      delete copie[g.idCoop];
      return copie;
    });

    try {
      // Le serveur refait tous les contrôles de stock au moment de l'enregistrement
      await creerCommande(
        g.idCoop,
        g.lignes.map((l) => ({ idRecolte: l.idRecolte, quantiteDemandee: l.quantite }))
      );
      retirerCoop(g.idCoop);
      setMessage(`Commande de ${g.nomCoop} enregistrée`);
      return true;
    } catch (err: any) {
      setErreurs((e) => ({ ...e, [g.idCoop]: err?.response?.data?.message ?? 'Commande impossible' }));
      return false;
    } finally {
      setEnvoi(null);
    }
  }

  async function validerTout() {
    setMessage('');
    let reussis = 0;
    for (const g of groupes) {
      if (await validerGroupe(g)) reussis++;
    }
    if (groupes.length > 0 && reussis === groupes.length) navigate('/commandes');
  }

  const boutonLien = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--bordure)',
    background: 'none',
    color: 'var(--texte)',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 style={{ margin: 0 }}>Panier</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)', fontSize: 13 }}>
              {lignes.length} récolte(s) · {groupes.length} coopérative(s) · total {kg(totalKg)}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" style={boutonLien} onClick={() => navigate('/commandes/ajouter')}>
              <ArrowLeft size={14} /> Continuer les achats
            </button>
            {lignes.length > 0 && (
              <button type="button" style={boutonLien} onClick={vider}>
                <Trash2 size={14} /> Vider le panier
              </button>
            )}
            {groupes.length > 0 && (
              <button
                type="button"
                className="btn-primary"
                disabled={envoi !== null}
                onClick={validerTout}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={14} /> Valider tout ({groupes.length} commande{groupes.length > 1 ? 's' : ''})
              </button>
            )}
          </div>
        </header>

        {message && (
          <section className="card">
            <p style={{ color: 'var(--accent)' }}>{message}</p>
          </section>
        )}

        {lignes.length === 0 && (
          <section className="card" style={{ textAlign: 'center', padding: 40 }}>
            <ShoppingBasket size={40} style={{ color: 'var(--texte-doux)' }} />
            <p style={{ color: 'var(--texte-doux)' }}>Le panier est vide.</p>
            <button type="button" className="btn-primary" onClick={() => navigate('/stock')}>
              Aller au stock
            </button>
          </section>
        )}

        {groupes.map((g) => (
          <section key={g.idCoop} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0 }}>
                {g.nomCoop}
                <span style={{ fontWeight: 400, color: 'var(--texte-doux)', fontSize: 13 }}>
                  {' '}· {g.lignes.length} ligne(s) · {kg(g.lignes.reduce((s, l) => s + l.quantite, 0))}
                </span>
              </h3>
              <button
                type="button"
                className="btn-primary"
                disabled={envoi !== null}
                onClick={() => validerGroupe(g)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Send size={14} /> {envoi === g.idCoop ? 'Envoi…' : 'Valider cette commande'}
              </button>
            </div>

            <table className="table" style={{ marginTop: 12 }}>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Membre</th>
                  <th>Date de récolte</th>
                  <th>Disponible</th>
                  <th>Quantité (kg)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {g.lignes.map((l) => (
                  <tr key={l.idRecolte}>
                    <td>{l.nomProduit}</td>
                    <td>{l.prenomMembre} {l.nomMembre ?? ''}</td>
                    <td>{dateFr(l.dateRecolte)}</td>
                    <td>{kg(l.quantiteDisponible)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        max={l.quantiteDisponible}
                        value={l.quantite}
                        onChange={(e) => modifier(l.idRecolte, nombre(e.target.value) || 0)}
                        style={{
                          width: 130,
                          padding: 8,
                          borderRadius: 8,
                          border: '1px solid var(--bordure)',
                          background: 'var(--fond-side)',
                          color: 'var(--texte)',
                        }}
                      />
                    </td>
                    <td>
                      <button type="button" style={{ ...boutonLien, color: '#ef4444' }} onClick={() => retirer(l.idRecolte)}>
                        <Trash2 size={14} /> Retirer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {erreurs[g.idCoop] && <p style={{ color: '#ef4444', marginTop: 12 }}>{erreurs[g.idCoop]}</p>}
          </section>
        ))}
      </main>
    </div>
  );
}