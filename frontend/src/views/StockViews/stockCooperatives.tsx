import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getStockCooperatives, getStockSoam } from '../../services/stock.service';
import type { StockCooperative, StockSoam } from '../../services/stock.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

type Utilisateur = { role: string; idCoop: string | null };

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function StockCooperatives() {
  const navigate = useNavigate();
  const utilisateur: Utilisateur | null = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  const [lignes, setLignes] = useState<StockCooperative[]>([]);
  const [soam, setSoam] = useState<StockSoam[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [filtreCoop, setFiltreCoop] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  // Président : sa coopérative. Responsable : le filtre choisi (vide = toutes)
  const idCoop = estPresident ? (utilisateur?.idCoop ?? undefined) : (filtreCoop || undefined);

  useEffect(() => {
    if (!estPresident) {
      getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
      getStockSoam().then(setSoam).catch(() => {});
    }
  }, [estPresident]);

  useEffect(() => {
    setChargement(true);
    getStockCooperatives(idCoop)
      .then((liste) => {
        setLignes(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger le stock'))
      .finally(() => setChargement(false));
  }, [idCoop]);

  function voirDetail(l: StockCooperative) {
    navigate(`/stock/detail?idCoop=${l.idCoop}&idProduit=${l.idProduit}`);
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
          <h1>{estPresident ? 'Stock de ma coopérative' : 'Stock des coopératives'}</h1>
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
          <h3>Stock disponible par produit</h3>
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && !erreur && lignes.length === 0 && <p>Aucun stock disponible.</p>}

          {!chargement && lignes.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  {!estPresident && <th>Coopérative</th>}
                  <th>Produit</th>
                  <th>Quantité disponible</th>
                  <th>Récoltes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {lignes.map((l) => (
                  <tr key={`${l.idCoop}-${l.idProduit}`}>
                    {!estPresident && <td>{l.nomCoop}</td>}
                    <td>{l.nomProduit}</td>
                    <td>
                      {l.quantiteRestante > 0 ? (
                        formaterKg(l.quantiteRestante)
                      ) : (
                        <span style={{ color: '#ef4444' }}>Stock épuisé</span>
                      )}
                    </td>
                    <td>{l.nbRecoltes}</td>
                    <td>
                      <button type="button" style={boutonLien} onClick={() => voirDetail(l)}>
                        Détail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {!estPresident && (
          <section className="card">
            <h3>Stock central SOAM</h3>
            {soam.length === 0 && <p>Aucun stock enregistré au niveau SOAM.</p>}
            {soam.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                  </tr>
                </thead>
                <tbody>
                  {soam.map((s) => (
                    <tr key={s.idProduit}>
                      <td>{s.nomProduit}</td>
                      <td>{formaterKg(s.quantiteStock)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        )}
      </main>
    </div>
  );
}