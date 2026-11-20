import { useEffect, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import {
  getProduits,
  modifierProduit,
  supprimerProduit,
} from '../../services/produit.service';
import type { Produit } from '../../services/produit.service';
import '../../styles/dashboard.css';

// Message renvoyé par le backend, ou un message par défaut
function messageDe(err: any, defaut: string): string {
  return err?.response?.data?.message ?? defaut;
}

export default function ListeProduits() {
  const navigate = useNavigate();
  const [produits, setProduits] = useState<Produit[]>([]);
  const [enEdition, setEnEdition] = useState<string | null>(null);
  const [valeurEdition, setValeurEdition] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion] = useState(0);

  // Recharge la liste depuis le serveur à chaque changement
  useEffect(() => {
    setChargement(true);
    getProduits()
      .then((liste) => setProduits(liste))
      .catch(() => setErreur('Impossible de charger les produits'))
      .finally(() => setChargement(false));
  }, [version]);

  // Efface le message de succès après quelques secondes
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  function effacerMessages() {
    setErreur('');
    setMessage('');
  }

  function commencerEdition(p: Produit) {
    effacerMessages();
    setEnEdition(p.idProduit);
    setValeurEdition(p.nomProduit);
  }

  function annulerEdition() {
    setEnEdition(null);
    setValeurEdition('');
  }

  async function enregistrerEdition(idProduit: string) {
    if (!valeurEdition.trim()) {
      setErreur('Le nom ne peut pas être vide');
      return;
    }
    effacerMessages();
    try {
      await modifierProduit(idProduit, valeurEdition.trim());
      annulerEdition();
      setMessage('Produit modifié');
      setVersion((v) => v + 1);
    } catch (err) {
      setErreur(messageDe(err, 'Modification impossible'));
    }
  }

  // Entrée valide la modification, Échap l'annule
  function toucheEdition(e: KeyboardEvent<HTMLInputElement>, idProduit: string) {
    if (e.key === 'Enter') enregistrerEdition(idProduit);
    if (e.key === 'Escape') annulerEdition();
  }

  async function supprimer(p: Produit) {
    if (!window.confirm(`Supprimer le produit « ${p.nomProduit} » ?`)) return;
    effacerMessages();
    try {
      await supprimerProduit(p.idProduit);
      setMessage('Produit supprimé');
      setVersion((v) => v + 1);
    } catch (err) {
      setErreur(messageDe(err, 'Suppression impossible'));
    }
  }

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Produits</h1>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/produits/ajouter')}
          >
            + Ajouter un produit
          </button>
        </header>

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}

          {chargement && <p>Chargement...</p>}
          {!chargement && produits.length === 0 && <p>Aucun produit enregistré.</p>}

          {!chargement && produits.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => {
                  const enCours = enEdition === p.idProduit;
                  return (
                    <tr key={p.idProduit}>
                      <td>{p.idProduit}</td>
                      <td>
                        {enCours ? (
                          <input
                            aria-label={`Nouveau nom de ${p.nomProduit}`}
                            autoFocus
                            value={valeurEdition}
                            onChange={(e) => setValeurEdition(e.target.value)}
                            onKeyDown={(e) => toucheEdition(e, p.idProduit)}
                            style={{ padding: 6 }}
                          />
                        ) : (
                          p.nomProduit
                        )}
                      </td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        {enCours ? (
                          <>
                            <button
                              type="button"
                              onClick={() => enregistrerEdition(p.idProduit)}
                              disabled={!valeurEdition.trim()}
                              style={boutonLien}
                            >
                              Enregistrer
                            </button>
                            <button type="button" onClick={annulerEdition} style={boutonLien}>
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button type="button" onClick={() => commencerEdition(p)} style={boutonLien}>
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => supprimer(p)}
                              style={{ ...boutonLien, color: '#ef4444' }}
                            >
                              Supprimer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}