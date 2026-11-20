import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getCommandes } from '../../services/commande.service';
import type { Commande } from '../../services/commande.service';
import '../../styles/dashboard.css';

const LIBELLES: Record<Commande['statutCommande'], string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
};

const CLASSES: Record<Commande['statutCommande'], string> = {
  EN_ATTENTE: 'attente',
  EN_COURS_LIVRAISON: 'cours',
  LIVREE: 'livree',
  REFUSEE: 'refusee',
};

function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function ListeCommandes() {
  const navigate = useNavigate();
  const utilisateur: { role: string } | null = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getCommandes()
      .then(setCommandes)
      .catch(() => setErreur('Impossible de charger les commandes'))
      .finally(() => setChargement(false));
  }, []);

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
          <h1>{estPresident ? 'Commandes reçues' : 'Commandes'}</h1>
          {!estPresident && (
            <button type="button" className="btn-primary" onClick={() => navigate('/commandes/ajouter')}>
              + Nouvelle commande
            </button>
          )}
        </header>

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && !erreur && commandes.length === 0 && <p>Aucune commande enregistrée.</p>}

          {!chargement && commandes.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  {!estPresident && <th>Coopérative</th>}
                  <th>Lignes</th>
                  <th>Quantité totale</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((c) => (
                  <tr key={c.idCommande}>
                    <td>{formaterDate(c.dateCommande)}</td>
                    {!estPresident && <td>{c.nomCoop}</td>}
                    <td>{c.nbLignes}</td>
                    <td>{formaterKg(c.quantiteTotale)}</td>
                    <td><span className={`badge ${CLASSES[c.statutCommande]}`}>{LIBELLES[c.statutCommande]}</span></td>
                    <td>{c.statutPaiement === 'PAYE' ? 'Payé' : 'Non payé'}</td>
                    <td>
                      <button
                        type="button"
                        style={boutonLien}
                        onClick={() => navigate(`/commandes/${c.idCommande}`)}
                      >
                        Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}