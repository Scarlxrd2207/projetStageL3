import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getDetailStock } from '../../services/stock.service';
import type { DetailStock } from '../../services/stock.service';
<<<<<<< HEAD
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
=======
import '../../styles/dashboard.css';

type Utilisateur = { role: string; idCoop: string | null };

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split('-');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function DetailStockPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
<<<<<<< HEAD
  const session = lireSession();
  const estPresident = session?.role === 'PRESIDENT';

  const idCoop = params.get('idCoop') ?? '';
  const idProduit = params.get('idProduit') ?? '';

  // Un président ne consulte que le stock de sa propre coopérative
  const accesAutorise = !estPresident || session?.idCoop === idCoop;
=======
  const idCoop = params.get('idCoop') ?? '';
  const idProduit = params.get('idProduit') ?? '';

  const utilisateur: Utilisateur | null = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  // Un président ne consulte que le stock de sa propre coopérative
  const accesAutorise = !estPresident || utilisateur?.idCoop === idCoop;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  const [detail, setDetail] = useState<DetailStock | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!accesAutorise) {
      setErreur("Accès refusé : ce stock n'appartient pas à votre coopérative");
      return;
    }
    if (!idCoop || !idProduit) {
      setErreur('Stock introuvable');
      return;
    }
    getDetailStock(idCoop, idProduit)
      .then((d) => {
        setDetail(d);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger le détail du stock'));
  }, [idCoop, idProduit, accesAutorise]);

  const total = detail ? detail.recoltes.reduce((somme, r) => somme + r.quantiteRestante, 0) : 0;

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
          <h1>{detail ? `${detail.nomProduit} : ${detail.nomCoop}` : 'Détail du stock'}</h1>
          <button type="button" style={boutonLien} onClick={() => navigate('/stock')}>
            Retour au stock
          </button>
        </header>

        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {detail && (
          <>
            <section className="card">
              <div className="kpi-label">Quantité disponible</div>
              <div className="kpi-value">{formaterKg(total)}</div>
            </section>

            <section className="card">
              <h3>Récoltes qui composent ce stock</h3>
              {detail.recoltes.length === 0 && <p>Aucune récolte enregistrée.</p>}

              {detail.recoltes.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Membre producteur</th>
                      <th>Lieu</th>
                      <th>Déclarée</th>
                      <th>Restante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.recoltes.map((r, i) => (
                      <tr key={i}>
                        <td>{formaterDate(r.dateRecolte)}</td>
                        <td>{r.prenomMembre} {r.nomMembre}</td>
                        <td>{r.districtMembre} · {r.communeMembre} · {r.fokotanyMembre}</td>
                        <td>{formaterKg(r.quantiteDeclaree)}</td>
                        <td>{formaterKg(r.quantiteRestante)}</td>
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