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
  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
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
      </main>
    </div>
  );
}