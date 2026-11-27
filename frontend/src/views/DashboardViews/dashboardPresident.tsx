<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDashboardPresident } from '../../services/dashboard.service';
import type { DonneesPresident } from '../../services/dashboard.service';
import { useMaj } from '../../hooks/useTempsReel';
import '../../styles/dashboard.css';

const LIBELLES = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
} as const;

const CLASSES = {
  EN_ATTENTE: 'attente',
  EN_COURS_LIVRAISON: 'cours',
  LIVREE: 'livree',
  REFUSEE: 'refusee',
} as const;

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

export default function DashboardPresident() {
  const navigate = useNavigate();
  const [donnees, setDonnees] = useState<DonneesPresident | null>(null);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(() => {
    getDashboardPresident()
      .then((d) => {
        setDonnees(d);
        setErreur('');
      })
      .catch((err: any) =>
        setErreur(err?.response?.data?.message ?? 'Impossible de charger le tableau de bord')
      );
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Chiffres mis à jour dès qu'une commande, un paiement ou une livraison change
  useMaj(charger);

  const kpis = donnees
    ? [
        { label: 'Membres actifs', valeur: String(donnees.indicateurs.membresActifs) },
        { label: 'Récoltes déclarées', valeur: String(donnees.indicateurs.recoltes) },
        { label: 'Stock disponible', valeur: formaterKg(donnees.indicateurs.stockKg) },
        { label: 'Commandes à traiter', valeur: String(donnees.indicateurs.commandesAttente) },
        { label: 'Livraisons en cours', valeur: String(donnees.indicateurs.livraisonsEnCours) },
        { label: 'Paiements en attente', valeur: String(donnees.indicateurs.paiementsEnAttente) },
      ]
    : [];

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  };

=======
import Sidebar from '../../components/Sidebar';
import '../../styles/dashboard.css';

const kpis = [
  { label: 'Membres actifs', valeur: '64', variation: '+3 ce mois', tendance: 'up' },
  { label: 'Récoltes déclarées', valeur: '182', variation: '+12 cette semaine', tendance: 'up' },
  { label: 'Stock de la coopérative (kg)', valeur: '9 340', variation: '-6 % ce mois', tendance: 'down' },
  { label: 'Commandes à traiter', valeur: '2', variation: 'À traiter aujourd\'hui', tendance: 'down' },
];

const commandes = [
  { ref: 'CMD-0001', produit: 'Maïs', quantite: '1 200 kg', statut: 'livree', libelle: 'Livrée' },
  { ref: 'CMD-0002', produit: 'Riz', quantite: '850 kg', statut: 'cours', libelle: 'En cours' },
  { ref: 'CMD-0005', produit: 'Café', quantite: '430 kg', statut: 'attente', libelle: 'En attente' },
];

export default function DashboardPresident() {
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
<<<<<<< HEAD
          <h1>Tableau de bord de ma coopérative</h1>
        </header>

        {erreur && <section className="card"><p style={{ color: '#ef4444' }}>{erreur}</p></section>}

        {donnees && (
          <>
            <section className="kpi-grid">
              {kpis.map((k) => (
                <div key={k.label} className="card">
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-value">{k.valeur}</div>
                </div>
              ))}
            </section>

            <section className="card">
              <h3>Dernières commandes reçues</h3>

              {donnees.commandes.length === 0 && <p>Aucune commande reçue.</p>}

              {donnees.commandes.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Quantité totale</th>
                      <th>Statut</th>
                      <th>Paiement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donnees.commandes.map((c) => (
                      <tr key={c.idCommande}>
                        <td>{formaterDate(c.dateCommande)}</td>
                        <td>{formaterKg(c.quantiteTotale)}</td>
                        <td>
                          <span className={`badge ${CLASSES[c.statutCommande]}`}>{LIBELLES[c.statutCommande]}</span>
                        </td>
                        <td>{c.statutPaiement === 'PAYE' ? 'Payé' : 'Non payé'}</td>
                        <td>
                          <button type="button" style={boutonLien} onClick={() => navigate(`/commandes/${c.idCommande}`)}>
                            Détail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
=======
          <h1>Tableau de bord — Coopérative</h1>
          <button className="btn-primary">+ Déclarer une récolte</button>
        </header>

        <section className="kpi-grid">
          {kpis.map((k) => (
            <div key={k.label} className="card">
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.valeur}</div>
              <div className={`kpi-var ${k.tendance}`}>{k.variation}</div>
            </div>
          ))}
        </section>

        <section className="row">
          <div className="card">
            <h3>Commandes reçues</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {commandes.map((c) => (
                  <tr key={c.ref}>
                    <td>{c.ref}</td>
                    <td>{c.produit}</td>
                    <td>{c.quantite}</td>
                    <td><span className={`badge ${c.statut}`}>{c.libelle}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card highlight">
            <h3>Livraisons</h3>
            <div style={{ fontSize: 36, fontWeight: 700 }}>2</div>
            <p>Commandes en cours de livraison</p>
          </div>
        </section>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      </main>
    </div>
  );
}