<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import BarreRecherche from '../../components/BarreRecherche';
import { getRecoltes, supprimerRecolte } from '../../services/recolte.service';
import type { Recolte } from '../../services/recolte.service';
import { contient, dansPeriode } from '../../utils/filtres';
=======
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getRecoltes, supprimerRecolte } from '../../services/recolte.service';
import type { Recolte } from '../../services/recolte.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import '../../styles/dashboard.css';

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
<<<<<<< HEAD
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
=======
  const [annee, mois, jour] = iso.split('-');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function ListeRecoltes() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [texte, setTexte] = useState('');
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    setChargement(true);
    getRecoltes()
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      .then((liste) => {
        setRecoltes(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger les récoltes'))
      .finally(() => setChargement(false));
<<<<<<< HEAD
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);
=======
  }, [idCoop, version]);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

<<<<<<< HEAD
  const affichees = recoltes.filter(
    (r) =>
      contient(texte, [
        r.nomProduit,
        r.nomMembre,
        r.prenomMembre,
        r.districtMembre,
        r.communeMembre,
        r.fokotanyMembre,
      ]) && dansPeriode(r.dateRecolte, du, au)
  );

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  async function supprimer(r: Recolte) {
    if (!window.confirm(`Supprimer la récolte de ${r.prenomMembre} ${r.nomMembre} (${r.nomProduit}) ?`)) {
      return;
    }
    setErreur('');
<<<<<<< HEAD
    try {
      await supprimerRecolte(r.idRecolte);
      setMessage('Récolte supprimée');
      charger();
=======
    setMessage('');
    try {
      await supprimerRecolte(r.idRecolte);
      setMessage('Récolte supprimée');
      setVersion((v) => v + 1);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
=======
  const select = {
    padding: 8,
    minWidth: 220,
    background: 'var(--fond-carte)',
    color: 'var(--texte)',
    border: '1px solid var(--bordure)',
    borderRadius: 8,
  };

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
<<<<<<< HEAD
          <h1>Récoltes de ma coopérative</h1>
=======
          <h1>Récoltes</h1>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
          <button type="button" className="btn-primary" onClick={() => navigate('/recoltes/ajouter')}>
            + Ajouter une récolte
          </button>
        </header>

<<<<<<< HEAD
        <section className="card">
          <BarreRecherche
            texte={texte}
            onTexte={setTexte}
            placeholder="Rechercher par produit, membre, lieu…"
            avecDates
            du={du}
            au={au}
            onDu={setDu}
            onAu={setAu}
          />
        </section>
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
          {chargement && <p>Chargement...</p>}
<<<<<<< HEAD
          {!chargement && !erreur && affichees.length === 0 && <p>Aucune récolte trouvée.</p>}

          {affichees.length > 0 && (
=======
          {!chargement && recoltes.length === 0 && <p>Aucune récolte enregistrée.</p>}

          {!chargement && recoltes.length > 0 && (
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Membre</th>
<<<<<<< HEAD
=======
                  <th>Coopérative</th>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                  <th>Lieu</th>
                  <th>Déclarée</th>
                  <th>Restante</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
<<<<<<< HEAD
                {affichees.map((r) => (
=======
                {recoltes.map((r) => (
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                  <tr key={r.idRecolte}>
                    <td>{formaterDate(r.dateRecolte)}</td>
                    <td>{r.nomProduit}</td>
                    <td>{r.prenomMembre} {r.nomMembre}</td>
<<<<<<< HEAD
                    <td>{r.districtMembre} · {r.communeMembre} · {r.fokotanyMembre}</td>
=======
                    <td>{r.nomCoop}</td>
                    <td>
                      {r.districtMembre} · {r.communeMembre} · {r.fokotanyMembre}
                    </td>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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