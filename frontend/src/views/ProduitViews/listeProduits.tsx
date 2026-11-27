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
<<<<<<< HEAD
  const [nomEdition, setNomEdition] = useState('');
  const [prixEdition, setPrixEdition] = useState('');
=======
  const [valeurEdition, setValeurEdition] = useState('');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion] = useState(0);

  // Recharge la liste depuis le serveur à chaque changement
  useEffect(() => {
    setChargement(true);
    getProduits()
      .then((liste) => setProduits(liste))
<<<<<<< HEAD
      .catch((err) => setErreur(messageDe(err, 'Impossible de charger les produits')))
=======
      .catch(() => setErreur('Impossible de charger les produits'))
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
    setNomEdition(p.nomProduit);
    setPrixEdition(String(p.prixUnitaire));
=======
    setValeurEdition(p.nomProduit);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  }

  function annulerEdition() {
    setEnEdition(null);
<<<<<<< HEAD
    setNomEdition('');
    setPrixEdition('');
  }

  // Le prix est accepté avec une virgule ou un point
  function prixValide(): number | null {
    const valeur = Number(prixEdition.trim().replace(',', '.'));
    return prixEdition.trim() !== '' && Number.isFinite(valeur) && valeur >= 0 ? valeur : null;
  }

  async function enregistrerEdition(idProduit: string) {
    if (!nomEdition.trim()) {
      setErreur('Le nom ne peut pas être vide');
      return;
    }
    const prix = prixValide();
    if (prix === null) {
      setErreur('Le prix doit être un nombre positif ou nul');
      return;
    }

    effacerMessages();
    try {
      await modifierProduit(idProduit, { nomProduit: nomEdition.trim(), prixUnitaire: prix });
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
  const champ = { padding: 6, borderRadius: 8, border: '1px solid var(--bordure)', background: 'var(--fond-side)', color: 'var(--texte)' };

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Produits</h1>
<<<<<<< HEAD
          <button type="button" className="btn-primary" onClick={() => navigate('/produits/ajouter')}>
=======
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/produits/ajouter')}
          >
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
                  <th>Prix (Ar/kg)</th>
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {produits.map((p) => {
                  const enCours = enEdition === p.idProduit;
                  return (
                    <tr key={p.idProduit}>
                      <td>{p.idProduit}</td>
<<<<<<< HEAD

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                      <td>
                        {enCours ? (
                          <input
                            aria-label={`Nouveau nom de ${p.nomProduit}`}
                            autoFocus
<<<<<<< HEAD
                            value={nomEdition}
                            onChange={(e) => setNomEdition(e.target.value)}
                            onKeyDown={(e) => toucheEdition(e, p.idProduit)}
                            style={champ}
=======
                            value={valeurEdition}
                            onChange={(e) => setValeurEdition(e.target.value)}
                            onKeyDown={(e) => toucheEdition(e, p.idProduit)}
                            style={{ padding: 6 }}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                          />
                        ) : (
                          p.nomProduit
                        )}
                      </td>
<<<<<<< HEAD

                      <td>
                        {enCours ? (
                          <input
                            aria-label={`Nouveau prix de ${p.nomProduit}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={prixEdition}
                            onChange={(e) => setPrixEdition(e.target.value)}
                            onKeyDown={(e) => toucheEdition(e, p.idProduit)}
                            style={{ ...champ, width: 130 }}
                          />
                        ) : (
                          `${Number(p.prixUnitaire).toLocaleString('fr-FR')} Ar`
                        )}
                      </td>

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                      <td style={{ display: 'flex', gap: 8 }}>
                        {enCours ? (
                          <>
                            <button
                              type="button"
                              onClick={() => enregistrerEdition(p.idProduit)}
<<<<<<< HEAD
                              disabled={!nomEdition.trim() || prixValide() === null}
=======
                              disabled={!valeurEdition.trim()}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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