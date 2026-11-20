import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getMembres, desactiverMembre } from '../../services/membre.service';
import type { Membre } from '../../services/membre.service';
import { getCooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function ListeMembres() {
  const { id } = useParams<{ id: string }>();
  const utilisateur: { role: string; idCoop: string | null } | null =
    JSON.parse(localStorage.getItem('utilisateur') ?? 'null');

  // responsable : id dans l'adresse ; président : sa propre coopérative
  const idCoop: string | undefined =
    id ?? (utilisateur?.role === 'PRESIDENT' ? (utilisateur.idCoop ?? undefined) : undefined);

  const [membres, setMembres] = useState<Membre[]>([]);
  const [titre, setTitre] = useState('Membres');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setChargement(true);
    getMembres(idCoop)
      .then((liste) => { setMembres(liste); setErreur(''); })
      .catch(() => setErreur('Impossible de charger les membres'))
      .finally(() => setChargement(false));
  }, [idCoop, version]);

  useEffect(() => {
    if (!idCoop) return;
    getCooperative(idCoop)
      .then((c) => setTitre(`Membres de ${c.nomCoop}`))
      .catch(() => {});
  }, [idCoop]);

  async function desactiver(m: Membre) {
    if (!window.confirm(`Désactiver ${m.prenomMembre} ${m.nomMembre} ?`)) return;
    try {
      await desactiverMembre(m.idMembre);
      setVersion((v) => v + 1);
    } catch (err: any) {
      setErreur(err.response?.data?.message ?? 'Désactivation impossible');
    }
  }

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: 13,
  };

  const lienAjout = `/membres/ajouter${idCoop ? `?idCoop=${idCoop}` : ''}`;

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>{titre}</h1>
          <Link to={lienAjout} className="btn-primary" style={{ textDecoration: 'none' }}>
            + Ajouter un membre
          </Link>
        </header>

        <section className="card">
          {chargement && <p>Chargement...</p>}
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {!chargement && !erreur && membres.length === 0 && <p>Aucun membre enregistré.</p>}

          {membres.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Téléphone</th>
                  <th>District</th>
                  <th>Commune</th>
                  <th>Fokontany</th>
                  <th>Coopérative</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {membres.map((m) => (
                  <tr key={m.idMembre}>
                    <td>{m.idMembre}</td>
                    <td>{m.nomMembre}</td>
                    <td>{m.prenomMembre}</td>
                    <td>{m.telephoneMembre ?? '—'}</td>
                    <td>{m.districtMembre}</td>
                    <td>{m.communeMembre}</td>
                    <td>{m.fokotanyMembre}</td>
                    <td>{m.idCoop}</td>
                    <td>{m.actifMembre === 'Oui' ? 'Actif' : 'Inactif'}</td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <Link to={`/membres/${m.idMembre}/modifier`} style={boutonLien}>Modifier</Link>
                      {m.actifMembre === 'Oui' && (
                        <button onClick={() => desactiver(m)} style={{ ...boutonLien, color: '#ef4444' }}>
                          Désactiver
                        </button>
                      )}
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