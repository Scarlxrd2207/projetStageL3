import { useEffect, useState } from 'react';
import { Truck, Wallet, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getTableau, messageErreur } from '../../services/statistiques.service';
import type { TableauStats } from '../../services/statistiques.service';
import { lireSession } from '../../utils/session';
import { formaterAr } from '../../utils/format';
import '../../styles/dashboard.css';

function kg(n: number): string {
  return `${Math.round(n).toLocaleString('fr-FR')} kg`;
}

// Barres horizontales : une par coopérative (ou une seule pour le président)
function BarresCooperatives({ items }: { items: { nom: string; valeur: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.valeur));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((i) => (
        <div key={i.nom}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span>{i.nom}</span>
            <strong>{kg(i.valeur)}</strong>
          </div>
          <div style={{ height: 12, borderRadius: 6, background: 'var(--fond-side)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(i.valeur / max) * 100}%`,
                height: '100%',
                background: '#22c55e',
                borderRadius: 6,
                minWidth: i.valeur > 0 ? 4 : 0,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Courbe : livraisons par mois
function CourbeMois({ points }: { points: { libelle: string; valeur: number }[] }) {
  const largeur = 640;
  const hauteur = 260;
  const marge = 40;
  const base = hauteur - 40;
  const zone = base - marge;
  const max = Math.max(1, ...points.map((p) => p.valeur));
  const pas = points.length > 1 ? (largeur - 2 * marge) / (points.length - 1) : 0;

  const coords = points.map((p, k) => ({
    x: marge + k * pas,
    y: base - (p.valeur / max) * zone,
    ...p,
  }));

  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} width="100%" role="img" aria-label="Livraisons par mois">
      <line x1={marge} y1={base} x2={largeur - marge} y2={base} stroke="var(--bordure)" />
      {coords.length > 1 && (
        <polyline
          points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
          fill="none"
          stroke="#22c55e"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      )}
      {coords.map((c) => (
        <g key={c.libelle}>
          <circle cx={c.x} cy={c.y} r={4.5} fill="#22c55e" />
          <text x={c.x} y={c.y - 10} textAnchor="middle" fontSize="11" fill="var(--texte)">
            {c.valeur > 0 ? Math.round(c.valeur).toLocaleString('fr-FR') : ''}
          </text>
          <text x={c.x} y={base + 18} textAnchor="middle" fontSize="11" fill="var(--texte-doux)">
            {c.libelle}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function DashboardStatistiques() {
  const estPresident = lireSession()?.role === 'PRESIDENT';

  const [stats, setStats] = useState<TableauStats | null>(null);
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    setChargement(true);
    getTableau(du || undefined, au || undefined)
      .then((s) => {
        setStats(s);
        setErreur('');
      })
      .catch((err) => setErreur(messageErreur(err, 'Impossible de charger les statistiques')))
      .finally(() => setChargement(false));
  }, [du, au]);

  const kpis = stats?.kpis;
  const aucuneLivraison = stats ? stats.parMois.every((m) => m.quantiteLivree === 0) : true;

  const cartes = kpis
    ? [
        { label: 'Total livré', valeur: kg(kpis.totalLivre), icone: <Truck size={20} />, couleur: 'var(--texte)' },
        {
          label: 'Total dû',
          valeur: formaterAr(kpis.totalDu),
          icone: <Wallet size={20} />,
          couleur: kpis.totalDu > 0 ? '#ef4444' : 'var(--texte)',
        },
        { label: 'Total payé', valeur: formaterAr(kpis.totalPaye), icone: <CheckCircle size={20} />, couleur: 'var(--accent)' },
        { label: 'Commandes en cours', valeur: String(kpis.commandesEnCours), icone: <Clock size={20} />, couleur: 'var(--texte)' },
      ]
    : [];

  const champDate = {
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--bordure)',
    background: 'var(--fond-side)',
    color: 'var(--texte)',
  };

  const libelleChamp = { display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 12, color: 'var(--texte-doux)' };

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 style={{ margin: 0 }}>Tableau de bord des livraisons</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)' }}>
              {estPresident ? 'Données de votre coopérative' : 'Données de toutes les coopératives'}
            </p>
          </div>
        </header>

        <section className="card" style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={libelleChamp}>
            Du
            <input type="date" value={du} onChange={(e) => setDu(e.target.value)} style={champDate} />
          </label>
          <label style={libelleChamp}>
            Au
            <input type="date" value={au} onChange={(e) => setAu(e.target.value)} style={champDate} />
          </label>
          {(du || au) && (
            <button type="button" style={boutonLien} onClick={() => { setDu(''); setAu(''); }}>
              Toute la période
            </button>
          )}
          <span style={{ color: 'var(--texte-doux)', fontSize: 13 }}>
            Le filtre porte sur la date de commande.
          </span>
        </section>

        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}
        {chargement && !stats && !erreur && (
          <section className="card">
            <p>Chargement...</p>
          </section>
        )}

        {stats && (
          <>
            <section className="kpi-grid">
              {cartes.map((c) => (
                <div key={c.label} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="kpi-label">{c.label}</span>
                    <span style={{ color: 'var(--accent)' }}>{c.icone}</span>
                  </div>
                  <div className="kpi-value" style={{ fontSize: 22, color: c.couleur }}>{c.valeur}</div>
                </div>
              ))}
            </section>

            <section className="row">
              <div className="card">
                <h3>Quantité livrée {estPresident ? 'de votre coopérative' : 'par coopérative'}</h3>
                {stats.parCoop.every((c) => c.quantiteLivree === 0) ? (
                  <p style={{ color: 'var(--texte-doux)' }}>Aucune livraison sur cette période.</p>
                ) : (
                  <BarresCooperatives items={stats.parCoop.map((c) => ({ nom: c.nomCoop, valeur: c.quantiteLivree }))} />
                )}
              </div>

              <div className="card">
                <h3>Livraisons par mois (kg)</h3>
                {aucuneLivraison ? (
                  <p style={{ color: 'var(--texte-doux)' }}>Aucune livraison sur cette période.</p>
                ) : (
                  <CourbeMois points={stats.parMois.map((m) => ({ libelle: m.libelle, valeur: m.quantiteLivree }))} />
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}