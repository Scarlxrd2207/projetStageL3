import Sidebar from '../../components/Sidebar';
import '../../styles/dashboard.css';

const kpis = [
  { label: 'Coopératives inscrites', valeur: '12', variation: '+2 ce mois', tendance: 'up' },
  { label: 'Commandes en attente', valeur: '7', variation: '+3 cette semaine', tendance: 'up' },
  { label: 'Stock total (kg)', valeur: '48 250', variation: '-1,4 % ce mois', tendance: 'down' },
  { label: 'Paiements en attente', valeur: '4', variation: '-1 depuis hier', tendance: 'up' },
];

const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
const commandesParMois = [40, 65, 52, 80, 71, 95];

const commandes = [
  { ref: 'CMD-0001', coop: 'Coop Ambositra', produit: 'Maïs', quantite: '1 200 kg', statut: 'livree', libelle: 'Livrée' },
  { ref: 'CMD-0002', coop: 'Coop Antsirabe', produit: 'Riz', quantite: '850 kg', statut: 'cours', libelle: 'En cours' },
  { ref: 'CMD-0003', coop: 'Coop Fianarantsoa', produit: 'Café', quantite: '430 kg', statut: 'attente', libelle: 'En attente' },
  { ref: 'CMD-0004', coop: 'Coop Ambositra', produit: 'Haricot', quantite: '300 kg', statut: 'refusee', libelle: 'Refusée' },
];

const stockParProduit = [
  { nom: 'Maïs', valeur: 70 },
  { nom: 'Riz', valeur: 55 },
  { nom: 'Café', valeur: 35 },
  { nom: 'Haricot', valeur: 20 },
];

export default function DashboardResponsable() {
  const max = Math.max(...commandesParMois);

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Tableau de bord</h1>
          <button className="btn-primary">+ Nouvelle commande</button>
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
            <h3>Commandes par mois</h3>
            <svg viewBox="0 0 600 220" width="100%">
              {commandesParMois.map((v, i) => {
                const hauteur = (v / max) * 180;
                return (
                  <g key={mois[i]}>
                    <rect x={i * 100 + 30} y={200 - hauteur} width={40} height={hauteur} rx={6} fill="#22c55e" />
                    <text x={i * 100 + 50} y={216} textAnchor="middle" fill="#7f9c8b" fontSize="12">
                      {mois[i]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="card highlight">
            <h3>Stock par produit</h3>
            <div style={{ fontSize: 36, fontWeight: 700 }}>48 250 kg</div>
            <p style={{ marginTop: 4 }}>Quantités disponibles dans les coopératives</p>
            {stockParProduit.map((p) => (
              <div key={p.nom} className="bar-row">
                {p.nom}
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${p.valeur}%`, background: '#15803d' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h3>Dernières commandes</h3>
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Coopérative</th>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {commandes.map((c) => (
                <tr key={c.ref}>
                  <td>{c.ref}</td>
                  <td>{c.coop}</td>
                  <td>{c.produit}</td>
                  <td>{c.quantite}</td>
                  <td><span className={`badge ${c.statut}`}>{c.libelle}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}