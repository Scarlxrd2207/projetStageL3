import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import ChampRecherche from '../../components/ChampRecherche';
import {
  getCooperativesFiltrees,
  supprimerCooperative,
} from '../../services/cooperative.service';
import type { Cooperative, Filtres } from '../../services/cooperative.service';
import { NOMS_DISTRICTS, TOUTES_LES_COMMUNES, communesDe } from '../../utils/localites';
import '../../styles/dashboard.css';

export default function ListeCoop() {
  const [toutes, setToutes] = useState<Cooperative[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filtres, setFiltres] = useState<Filtres>({});
  const [version, setVersion] = useState(0);
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  // Liste complète, sert uniquement à proposer les fokontany existants
  useEffect(() => {
    getCooperativesFiltrees({}).then(setToutes).catch(() => {});
  }, [version]);

  // Liste filtrée, rechargée à chaque changement de filtre
  useEffect(() => {
    setChargement(true);
    getCooperativesFiltrees(filtres)
      .then((liste) => {
        setCooperatives(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger les coopératives'))
      .finally(() => setChargement(false));
  }, [filtres, version]);

  const fokotanys = useMemo(
    () => [...new Set(toutes.map((c) => c.fokotanyCoop))].sort(),
    [toutes]
  );

  function changer(champ: keyof Filtres, valeur: string) {
    setFiltres((f) => {
      const nouveau: Filtres = { ...f, [champ]: valeur || undefined };
      // Changer de district réinitialise la commune
      if (champ === 'district') nouveau.commune = undefined;
      return nouveau;
    });
  }

  async function supprimer(c: Cooperative) {
    if (!window.confirm(`Supprimer la coopérative ${c.nomCoop} (${c.idCoop}) ?`)) return;
    try {
      await supprimerCooperative(c.idCoop);
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
    textDecoration: 'none',
    fontSize: 13,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Coopératives</h1>
          <Link to="/cooperatives/ajouter" className="btn-primary" style={{ textDecoration: 'none' }}>
            + Ajouter une coopérative
          </Link>
        </header>

        <section className="card" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'end' }}>
          <div>
            <div className="kpi-label">District</div>
            <ChampRecherche
              options={NOMS_DISTRICTS}
              value={filtres.district ?? ''}
              onChange={(v) => changer('district', v)}
              placeholder="Tous les districts"
              style={{ minWidth: 200, marginBottom: 0 }}
            />
          </div>

          <div>
            <div className="kpi-label">Commune</div>
            <ChampRecherche
              options={filtres.district ? communesDe(filtres.district) : TOUTES_LES_COMMUNES}
              value={filtres.commune ?? ''}
              onChange={(v) => changer('commune', v)}
              placeholder="Toutes les communes"
              style={{ minWidth: 200, marginBottom: 0 }}
            />
          </div>

          <div>
            <div className="kpi-label">Fokontany</div>
            <ChampRecherche
              options={fokotanys}
              value={filtres.fokotany ?? ''}
              onChange={(v) => changer('fokotany', v)}
              placeholder="Tous les fokontany"
              style={{ minWidth: 200, marginBottom: 0 }}
            />
          </div>

          <button onClick={() => setFiltres({})} style={{ ...boutonLien, padding: '8px 14px' }}>
            Réinitialiser
          </button>
        </section>

        <section className="card">
          {chargement && <p>Chargement...</p>}
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {!chargement && !erreur && cooperatives.length === 0 && (
            <p>Aucune coopérative ne correspond à ces filtres.</p>
          )}

          {cooperatives.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Nom</th>
                  <th>District</th>
                  <th>Commune</th>
                  <th>Fokontany</th>
                  <th>Date d'adhésion</th>
                  <th>Membres</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cooperatives.map((c) => (
                  <tr key={c.idCoop}>
                    <td>{c.idCoop}</td>
                    <td>{c.nomCoop}</td>
                    <td>{c.districtCoop}</td>
                    <td>{c.communeCoop}</td>
                    <td>{c.fokotanyCoop}</td>
                    <td>{new Date(c.dateAdhesion).toLocaleDateString('fr-FR')}</td>
                    <td>{c.nombreMembres ?? 0}</td>
                    <td>{c.inscrite === 'Oui' ? 'Inscrite' : 'Non inscrite'}</td>
                    <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Link to={`/cooperatives/${c.idCoop}/membres`} style={boutonLien}>Membres</Link>
                      <Link to={`/cooperatives/${c.idCoop}/president/ajouter`} style={boutonLien}>Président</Link>
                      <Link to={`/cooperatives/${c.idCoop}/modifier`} style={boutonLien}>Modifier</Link>
                      <button onClick={() => supprimer(c)} style={{ ...boutonLien, color: '#ef4444' }}>
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