import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getRecoltes, supprimerRecolte } from '../../services/recolte.service';
import type { Recolte } from '../../services/recolte.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function ListeRecoltes() {
  const navigate = useNavigate();
  const utilisateur: { role: string; idCoop: string | null } | null =
    JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filtreCoop, setFiltreCoop] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion] = useState(0);

  // Président : sa coopérative uniquement. Responsable : le filtre choisi (vide = toutes)
  const idCoop = estPresident ? (utilisateur?.idCoop ?? undefined) : (filtreCoop || undefined);

  useEffect(() => {
    if (!estPresident) {
      getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
    }
  }, [estPresident]);

  useEffect(() => {
    setChargement(true);
    getRecoltes(idCoop)
      .then((liste) => {
        setRecoltes(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger les récoltes'))
      .finally(() => setChargement(false));
  }, [idCoop, version]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  async function supprimer(r: Recolte) {
    if (!window.confirm(`Supprimer la récolte de ${r.prenomMembre} ${r.nomMembre} (${r.nomProduit}) ?`)) {
      return;
    }
    setErreur('');
    setMessage('');
    try {
      await supprimerRecolte(r.idRecolte);
      setMessage('Récolte supprimée');
      setVersion((v) => v + 1);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Suppression impossible');
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

  const select = {
    padding: 8,
    minWidth: 220,
    background: 'var(--fond-carte)',
    color: 'var(--texte)',
    border: '1px solid var(--bordure)',
    borderRadius: 8,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Récoltes</h1>
          <button type="button" className="btn-primary" onClick={() => navigate('/recoltes/ajouter')}>
            + Ajouter une récolte
          </button>
        </header>

        {!estPresident && (
          <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <span className="kpi-label">Coopérative</span>
            <select style={select} value={filtreCoop} onChange={(e) => setFiltreCoop(e.target.value)}>
              <option value="">Toutes les coopératives</option>
              {cooperatives.map((c) => (
                <option key={c.idCoop} value={c.idCoop}>
                  {c.nomCoop}
                </option>
              ))}
            </select>
          </section>
        )}

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && recoltes.length === 0 && <p>Aucune récolte enregistrée.</p>}

          {!chargement && recoltes.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Membre</th>
                  <th>Coopérative</th>
                  <th>Lieu</th>
                  <th>Déclarée</th>
                  <th>Restante</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recoltes.map((r) => (
                  <tr key={r.idRecolte}>
                    <td>{formaterDate(r.dateRecolte)}</td>
                    <td>{r.nomProduit}</td>
                    <td>{r.prenomMembre} {r.nomMembre}</td>
                    <td>{r.nomCoop}</td>
                    <td>
                      {r.districtMembre} · {r.communeMembre} · {r.fokotanyMembre}
                    </td>
                    <td>{formaterKg(r.quantiteDeclaree)}</td>
                    <td>{formaterKg(r.quantiteRestante)}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button type="button" style={boutonLien} onClick={() => navigate(`/recoltes/${r.idRecolte}/modifier`)}>
                        Modifier
                      </button>
                      <button type="button" style={{ ...boutonLien, color: '#ef4444' }} onClick={() => supprimer(r)}>
                        Supprimer
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