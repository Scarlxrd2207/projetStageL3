import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ShoppingCart, Package, CreditCard } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getDashboardResponsable } from '../../services/dashboard.service';
import type { DonneesResponsable } from '../../services/dashboard.service';
import { useMaj } from '../../hooks/useTempsReel';
import '../../styles/dashboard.css';

const LIBELLES: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
};

const CLASSES: Record<string, string> = {
  EN_ATTENTE: 'attente',
  EN_COURS_LIVRAISON: 'cours',
  LIVREE: 'livree',
  REFUSEE: 'refusee',
};

function kg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

// "2026-11-18" devient "18/11/2026"
function dateFr(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

export default function DashboardResponsable() {
  const navigate = useNavigate();
  const [d, setD] = useState<DonneesResponsable | null>(null);
  const [erreur, setErreur] = useState('');

  const charger = useCallback(() => {
    getDashboardResponsable()
      .then((donnees) => {
        setD(donnees);
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

  const maxMois = d ? Math.max(1, ...d.commandesParMois.map((m) => m.nb)) : 1;
  const maxStock = d ? Math.max(1, ...d.stockParProduit.map((s) => s.quantiteStock)) : 1;

  const kpis: { label: string; valeur: string; Icone: LucideIcon; to: string }[] = d
    ? [
        { label: 'Coopératives inscrites', valeur: String(d.indicateurs.cooperatives), Icone: Building2, to: '/cooperatives' },
        { label: 'Commandes en attente', valeur: String(d.indicateurs.commandesAttente), Icone: ShoppingCart, to: '/commandes' },
        { label: 'Stock SOAM disponible', valeur: kg(d.indicateurs.stockKg), Icone: Package, to: '/stock' },
        { label: 'Paiements en attente', valeur: String(d.indicateurs.paiementsAttente), Icone: CreditCard, to: '/commandes' },
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

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 style={{ margin: 0 }}>Tableau de bord</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)' }}>Vue d'ensemble de la SOAM</p>
          </div>
        </header>

        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {d && (
          <>
            <section className="kpi-grid">
              {kpis.map((k) => {
                const Icone = k.Icone;
                return (
                  <div key={k.label} className="card kpi-carte" onClick={() => navigate(k.to)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="kpi-label">{k.label}</span>
                      <span style={{ color: 'var(--accent)', display: 'inline-flex' }}>
                        <Icone size={22} />
                      </span>
                    </div>
                    <div className="kpi-value">{k.valeur}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>Voir le détail →</div>
                  </div>
                );
              })}
            </section>

            <section className="row">
              <div className="card">
                <h3>Commandes des six derniers mois</h3>
                <svg viewBox="0 0 600 230" width="100%" role="img" aria-label="Commandes par mois">
                  {d.commandesParMois.map((m, i) => {
                    const hauteur = (m.nb / maxMois) * 160;
                    return (
                      <g key={m.cle}>
                        <rect x={i * 100 + 30} y={190 - hauteur} width={40} height={Math.max(hauteur, 2)} rx={6} fill="#22c55e" />
                        <text x={i * 100 + 50} y={180 - hauteur} textAnchor="middle" fill="var(--texte)" fontSize="12">
                          {m.nb}
                        </text>
                        <text x={i * 100 + 50} y={212} textAnchor="middle" fill="var(--texte-doux)" fontSize="12">
                          {m.libelle}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="card highlight">
                <h3>Stock SOAM par produit</h3>
                <div style={{ fontSize: 34, fontWeight: 700 }}>{kg(d.indicateurs.stockKg)}</div>
                <p style={{ marginTop: 4 }}>Quantités reçues et acceptées</p>
                {d.stockParProduit.length === 0 && <p>Aucun stock enregistré.</p>}
                {d.stockParProduit.map((s) => (
                  <div key={s.nomProduit} className="bar-row">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{s.nomProduit}</span>
                      <span>{kg(s.quantiteStock)}</span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(s.quantiteStock / maxStock) * 100}%`, background: 'var(--accent)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Dernières commandes</h3>
                <button type="button" style={boutonLien} onClick={() => navigate('/commandes')}>
                  Toutes les commandes
                </button>
              </div>

              {d.dernieresCommandes.length === 0 && <p>Aucune commande pour le moment.</p>}

              {d.dernieresCommandes.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Coopérative</th>
                      <th>Quantité</th>
                      <th>Statut</th>
                      <th>Paiement</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.dernieresCommandes.map((c) => (
                      <tr key={c.idCommande}>
                        <td>{dateFr(c.dateCommande)}</td>
                        <td>{c.nomCoop}</td>
                        <td>{kg(c.quantiteTotale)}</td>
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
      </main>
    </div>
  );
}