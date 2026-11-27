import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import BarreRecherche from '../../components/BarreRecherche';
import { getRecoltes, supprimerRecolte } from '../../services/recolte.service';
import type { Recolte } from '../../services/recolte.service';
import { contient, dansPeriode } from '../../utils/filtres';
import '../../styles/dashboard.css';

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function ListeRecoltes() {
  const navigate = useNavigate();
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
      .then((liste) => {
        setRecoltes(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger les récoltes'))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

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

  async function supprimer(r: Recolte) {
    if (!window.confirm(`Supprimer la récolte de ${r.prenomMembre} ${r.nomMembre} (${r.nomProduit}) ?`)) {
      return;
    }
    setErreur('');
    try {
      await supprimerRecolte(r.idRecolte);
      setMessage('Récolte supprimée');
      charger();
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

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Récoltes de ma coopérative</h1>
          <button type="button" className="btn-primary" onClick={() => navigate('/recoltes/ajouter')}>
            + Ajouter une récolte
          </button>
        </header>

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

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && !erreur && affichees.length === 0 && <p>Aucune récolte trouvée.</p>}

          {affichees.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Produit</th>
                  <th>Membre</th>
                  <th>Lieu</th>
                  <th>Déclarée</th>
                  <th>Restante</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {affichees.map((r) => (
                  <tr key={r.idRecolte}>
                    <td>{formaterDate(r.dateRecolte)}</td>
                    <td>{r.nomProduit}</td>
                    <td>{r.prenomMembre} {r.nomMembre}</td>
                    <td>{r.districtMembre} · {r.communeMembre} · {r.fokotanyMembre}</td>
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