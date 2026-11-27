import { useCallback, useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRightLeft, ShoppingCart, Warehouse, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import BarreRecherche from '../../components/BarreRecherche';
import { getStockCooperatives, getStockSoam } from '../../services/stock.service';
import type { StockCooperative, StockSoam } from '../../services/stock.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { getProduits } from '../../services/produit.service';
import type { Produit } from '../../services/produit.service';
import { transformerStock } from '../../services/transformation.service';
import { lireSession } from '../../utils/session';
import { contient } from '../../utils/filtres';
import { useMaj } from '../../hooks/useTempsReel';
import { SEUIL_STOCK_BAS_KG, stockBas } from '../../utils/stock';
import '../../styles/dashboard.css';

function kg(n: number): string {
  return `${Number(n).toLocaleString('fr-FR')} kg`;
}

export default function StockCooperatives() {
  const navigate = useNavigate();
  const estPresident = lireSession()?.role === 'PRESIDENT';

  const [soam, setSoam] = useState<StockSoam[]>([]);
  const [coops, setCoops] = useState<StockCooperative[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [filtreCoop, setFiltreCoop] = useState('');
  const [filtreProduit, setFiltreProduit] = useState('');
  const [texte, setTexte] = useState('');

  // Sortie pour transformation
  const [aTransformer, setATransformer] = useState<StockSoam | null>(null);
  const [quantite, setQuantite] = useState('');
  const [motif, setMotif] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  const idCoopFiltre = estPresident ? undefined : filtreCoop || undefined;

  const chargerSoam = useCallback(() => {
    if (estPresident) return;
    getStockSoam()
      .then(setSoam)
      .catch(() => setErreur('Impossible de charger le stock central'));
  }, [estPresident]);

  const chargerCoops = useCallback(() => {
    getStockCooperatives(idCoopFiltre)
      .then(setCoops)
      .catch(() => setErreur('Impossible de charger le stock des coopératives'));
  }, [idCoopFiltre]);

  useEffect(() => {
    chargerSoam();
  }, [chargerSoam]);

  useEffect(() => {
    chargerCoops();
  }, [chargerCoops]);

  // Liste des produits pour le filtre (présidents et responsable)
  useEffect(() => {
    getProduits().then(setProduits).catch(() => setProduits([]));
  }, []);

  useEffect(() => {
    if (!estPresident) {
      getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
    }
  }, [estPresident]);

  // Stock rafraîchi dès qu'une commande ou une transformation change
  const surMaj = useCallback(() => {
    chargerSoam();
    chargerCoops();
  }, [chargerSoam, chargerCoops]);
  useMaj(surMaj);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(t);
  }, [message]);

  const soamBas = soam.filter((s) => stockBas(s.quantiteStock));

  // Filtre produit et recherche texte appliqués ensemble
  const coopsAffichees = useMemo(
    () =>
      coops.filter(
        (c) =>
          (!filtreProduit || c.idProduit === filtreProduit) &&
          contient(texte, [c.nomCoop, c.nomProduit])
      ),
    [coops, filtreProduit, texte]
  );

  // Total du stock visible, pour lire la consultation d'un coup d'œil
  const totalVisible = useMemo(
    () => coopsAffichees.reduce((somme, c) => somme + c.quantiteRestante, 0),
    [coopsAffichees]
  );

  function commander(l: StockCooperative) {
    navigate(`/commandes/ajouter?idCoop=${encodeURIComponent(l.idCoop)}&idProduit=${encodeURIComponent(l.idProduit)}`);
  }

  function ouvrirTransformation(s: StockSoam) {
    setErreur('');
    setMessage('');
    setATransformer(s);
    setQuantite('');
    setMotif('');
  }

  function fermerTransformation() {
    setATransformer(null);
    setQuantite('');
    setMotif('');
    setErreur('');
  }

  async function valider(e: FormEvent) {
    e.preventDefault();
    if (!aTransformer) return;

    const q = Number(quantite.replace(',', '.'));
    if (!Number.isFinite(q) || q <= 0) {
      setErreur('La quantité doit être supérieure à 0');
      return;
    }
    if (q > aTransformer.quantiteStock) {
      setErreur(`Stock insuffisant : ${kg(aTransformer.quantiteStock)} disponibles`);
      return;
    }

    setEnvoi(true);
    setErreur('');
    try {
      const r = await transformerStock(aTransformer.idProduit, q, motif.trim() || 'Transformation');
      setMessage(`Transformation enregistrée. Stock restant : ${kg(r.restant)}`);
      fermerTransformation();
      chargerSoam();
      chargerCoops();
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Transformation impossible');
    } finally {
      setEnvoi(false);
    }
  }

  const champ = {
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--bordure)',
    background: 'var(--fond-side)',
    color: 'var(--texte)',
  };

  const boutonLien = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--bordure)',
    background: 'none',
    color: 'var(--texte)',
    cursor: 'pointer',
    fontSize: 13,
  };

  const libelle = { display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 12, color: 'var(--texte-doux)' };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>{estPresident ? 'Stock de ma coopérative' : 'Stock'}</h1>
        </header>

        {message && (
          <section className="card">
            <p style={{ color: 'var(--accent)' }}>{message}</p>
          </section>
        )}

        {erreur && !aTransformer && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {!estPresident && soamBas.length > 0 && (
          <section className="card" style={{ display: 'flex', gap: 10, alignItems: 'center', color: '#b45309' }}>
            <AlertTriangle size={18} />
            <span>
              {soamBas.length} produit(s) au stock central à {SEUIL_STOCK_BAS_KG} kg ou moins :{' '}
              {soamBas.map((s) => `${s.nomProduit} (${kg(s.quantiteStock)})`).join(', ')}
            </span>
          </section>
        )}

        {!estPresident && (
          <section className="card">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Warehouse size={18} /> Stock central SOAM
            </h3>

            {soam.length === 0 && <p>Aucun stock enregistré au niveau SOAM.</p>}

            {soam.length > 0 && (
              <table className="table">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>État</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {soam.map((s) => (
                    <tr key={s.idProduit}>
                      <td>{s.nomProduit}</td>
                      <td>{kg(s.quantiteStock)}</td>
                      <td>
                        {stockBas(s.quantiteStock) ? (
                          <span className="badge refusee">Stock bas</span>
                        ) : (
                          <span className="badge livree">Disponible</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          style={boutonLien}
                          disabled={s.quantiteStock <= 0}
                          onClick={() => ouvrirTransformation(s)}
                        >
                          <ArrowRightLeft size={14} /> Transformer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {aTransformer && (
              <form
                onSubmit={valider}
                noValidate
                style={{ marginTop: 20, padding: 16, borderRadius: 12, border: '1px solid var(--bordure)', background: 'var(--fond-side)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: 0 }}>
                    Transformer : {aTransformer.nomProduit}
                    <span style={{ fontWeight: 400, color: 'var(--texte-doux)', fontSize: 14 }}>
                      {' '}· disponible : {kg(aTransformer.quantiteStock)}
                    </span>
                  </h3>
                  <button type="button" onClick={fermerTransformation} style={boutonLien} aria-label="Fermer">
                    <X size={14} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <label style={libelle}>
                    Quantité à transformer (kg)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      max={aTransformer.quantiteStock}
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                      style={{ ...champ, width: 180 }}
                      autoFocus
                    />
                  </label>

                  <label style={{ ...libelle, flex: 1, minWidth: 220 }}>
                    Motif (facultatif)
                    <input
                      value={motif}
                      onChange={(e) => setMotif(e.target.value)}
                      placeholder="Ex. transformation en farine"
                      maxLength={200}
                      style={champ}
                    />
                  </label>

                  <button type="submit" className="btn-primary" disabled={envoi}>
                    {envoi ? 'Enregistrement…' : 'Enregistrer la sortie'}
                  </button>
                </div>

                {erreur && <p style={{ color: '#ef4444', marginTop: 12 }}>{erreur}</p>}
              </form>
            )}
          </section>
        )}

        <section className="card">
          <h3>{estPresident ? 'Stock disponible par produit' : 'Stock des coopératives'}</h3>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 12 }}>
            {!estPresident && (
              <label style={libelle}>
                Coopérative
                <select value={filtreCoop} onChange={(e) => setFiltreCoop(e.target.value)} style={{ ...champ, minWidth: 220 }}>
                  <option value="">Toutes les coopératives</option>
                  {cooperatives.map((c) => (
                    <option key={c.idCoop} value={c.idCoop}>{c.nomCoop}</option>
                  ))}
                </select>
              </label>
            )}

            <label style={libelle}>
              Produit
              <select value={filtreProduit} onChange={(e) => setFiltreProduit(e.target.value)} style={{ ...champ, minWidth: 220 }}>
                <option value="">Tous les produits</option>
                {produits.map((p) => (
                  <option key={p.idProduit} value={p.idProduit}>{p.nomProduit}</option>
                ))}
              </select>
            </label>

            <div style={{ flex: 1, minWidth: 240 }}>
              <BarreRecherche texte={texte} onTexte={setTexte} placeholder="Rechercher un produit ou une coopérative…" />
            </div>
          </div>

          {coopsAffichees.length > 0 && (
            <p style={{ color: 'var(--texte-doux)', fontSize: 13, marginTop: 0 }}>
              {coopsAffichees.length} ligne(s) · total visible : <strong style={{ color: 'var(--texte)' }}>{kg(totalVisible)}</strong>
            </p>
          )}

          {coopsAffichees.length === 0 && <p>Aucun stock trouvé pour ce filtre.</p>}

          {coopsAffichees.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  {!estPresident && <th>Coopérative</th>}
                  <th>Produit</th>
                  <th>Quantité disponible</th>
                  <th>Récoltes</th>
                  {!estPresident && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {coopsAffichees.map((l) => (
                  <tr key={`${l.idCoop}-${l.idProduit}`}>
                    {!estPresident && <td>{l.nomCoop}</td>}
                    <td>{l.nomProduit}</td>
                    <td>
                      {l.quantiteRestante > 0 ? kg(l.quantiteRestante) : <span style={{ color: '#ef4444' }}>Stock épuisé</span>}
                    </td>
                    <td>{l.nbRecoltes}</td>
                    {!estPresident && (
                      <td>
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={l.quantiteRestante <= 0}
                          onClick={() => commander(l)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 13 }}
                        >
                          <ShoppingCart size={14} /> Commander
                        </button>
                      </td>
                    )}
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