import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket, Warehouse, Sprout, Plus } from 'lucide-react';
import type { Cooperative } from '../services/cooperative.service';
import type { Recolte } from '../services/recolte.service';
import { getRecoltesDisponibles } from '../services/recolte.service';
import type { StockCooperative } from '../services/stock.service';
import { getStockCooperatives } from '../services/stock.service';
import { usePanier } from '../context/PanierContext';

type Props = {
  cooperatives: Cooperative[];
  initialCoop?: string;
  initialProduit?: string;
};

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function kg(n: number): string {
  return `${Number(n).toLocaleString('fr-FR')} kg`;
}

function nombre(valeur: string): number {
  return Number(valeur.replace(',', '.'));
}

export default function FormulaireCommande({ cooperatives, initialCoop = '', initialProduit = '' }: Props) {
  const { lignes, ajouter } = usePanier();

  const [idCoop, setIdCoop] = useState(initialCoop);
  const [idProduitFiltre, setIdProduitFiltre] = useState(initialProduit);
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  const [stock, setStock] = useState<StockCooperative[]>([]);
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  // Au choix d'une coopérative : son stock et ses récoltes disponibles
  useEffect(() => {
    setSaisie({});
    setErreur('');
    setRecoltes([]);
    setStock([]);
    if (!idCoop) return;

    let annule = false;
    setChargement(true);

    Promise.all([getRecoltesDisponibles(idCoop), getStockCooperatives(idCoop)])
      .then(([r, s]) => {
        if (annule) return;
        setRecoltes(r);
        setStock(s);
      })
      .catch((err: any) => {
        if (!annule) setErreur(err?.response?.data?.message ?? 'Impossible de charger le stock de cette coopérative');
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });

    return () => {
      annule = true;
    };
  }, [idCoop]);

  // Quantité déjà réservée dans le panier pour une récolte
  function dansPanier(idRecolte: string): number {
    return lignes.find((l) => l.idRecolte === idRecolte)?.quantite ?? 0;
  }

  const recoltesAffichees = useMemo(
    () => (idProduitFiltre ? recoltes.filter((r) => r.idProduit === idProduitFiltre) : recoltes),
    [recoltes, idProduitFiltre]
  );

  const lignesCoop = lignes.filter((l) => l.idCoop === idCoop).length;

  function ajouterAuPanier(r: Recolte) {
    setErreur('');
    setMessage('');

    const q = nombre(saisie[r.idRecolte] ?? '');
    if (!(q > 0)) {
      setErreur('Saisissez une quantité supérieure à 0');
      return;
    }

    // Disponible = stock restant, moins ce qui est déjà réservé au panier
    const disponible = r.quantiteRestante - dansPanier(r.idRecolte);
    if (q > disponible) {
      setErreur(`Quantité trop élevée pour ${r.nomProduit} : ${kg(disponible)} encore disponibles`);
      return;
    }

    ajouter(
      {
        idRecolte: r.idRecolte,
        idCoop: r.idCoop,
        nomCoop: r.nomCoop,
        idProduit: r.idProduit,
        nomProduit: r.nomProduit,
        nomMembre: r.nomMembre,
        prenomMembre: r.prenomMembre,
        dateRecolte: r.dateRecolte,
        quantiteDisponible: r.quantiteRestante,
      },
      q
    );

    setSaisie((s) => ({ ...s, [r.idRecolte]: '' }));
    setMessage(`${r.nomProduit} (${kg(q)}) ajouté au panier`);
  }

  const label: CSSProperties = { display: 'block', marginBottom: 6, color: 'var(--texte-doux)', fontSize: 13 };
  const select: CSSProperties = {
    width: '100%',
    padding: 10,
    borderRadius: 10,
    border: '1px solid var(--bordure)',
    background: 'var(--fond-side)',
    color: 'var(--texte)',
    marginBottom: 20,
  };
  const carteStock = (actif: boolean): CSSProperties => ({
    border: actif ? '2px solid var(--accent)' : '1px solid var(--bordure)',
    borderRadius: 14,
    padding: 14,
    background: 'var(--fond-side)',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--texte)',
  });

  return (
    <div>
      <label style={label}>Coopérative</label>
      <select
        style={select}
        value={idCoop}
        onChange={(e) => {
          setIdCoop(e.target.value);
          setIdProduitFiltre('');
        }}
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop} ({c.idCoop})
          </option>
        ))}
      </select>

      {idCoop && chargement && <p style={{ color: 'var(--texte-doux)' }}>Chargement du stock…</p>}

      {idCoop && !chargement && (
        <>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Warehouse size={18} /> Stock de la coopérative
          </h3>

          {stock.length === 0 ? (
            <p style={{ color: 'var(--texte-doux)' }}>Aucun stock enregistré pour cette coopérative.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
              {stock.map((s) => (
                <button
                  type="button"
                  key={s.idProduit}
                  style={carteStock(idProduitFiltre === s.idProduit)}
                  onClick={() => setIdProduitFiltre(idProduitFiltre === s.idProduit ? '' : s.idProduit)}
                >
                  <div style={{ fontWeight: 600 }}>{s.nomProduit}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, margin: '6px 0' }}>{kg(s.quantiteRestante)}</div>
                  <div style={{ fontSize: 12, color: 'var(--texte-doux)' }}>
                    {s.quantiteRestante > 0 ? `${s.nbRecoltes} récolte(s)` : 'Stock épuisé'}
                  </div>
                </button>
              ))}
            </div>
          )}

          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sprout size={18} /> Récoltes disponibles
            {idProduitFiltre && (
              <span style={{ fontWeight: 400, fontSize: 13, color: 'var(--texte-doux)' }}>
                · filtre : {stock.find((s) => s.idProduit === idProduitFiltre)?.nomProduit ?? ''}
              </span>
            )}
          </h3>

          {recoltesAffichees.length === 0 ? (
            <p style={{ color: 'var(--texte-doux)' }}>Aucune récolte disponible pour ce choix.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Membre</th>
                  <th>Date de récolte</th>
                  <th>Disponible</th>
                  <th>Au panier</th>
                  <th>Quantité (kg)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recoltesAffichees.map((r) => {
                  const reserve = dansPanier(r.idRecolte);
                  const reste = r.quantiteRestante - reserve;
                  return (
                    <tr key={r.idRecolte}>
                      <td>{r.nomProduit}</td>
                      <td>{r.prenomMembre} {r.nomMembre}</td>
                      <td>{formaterDate(r.dateRecolte)}</td>
                      <td>{kg(reste)}</td>
                      <td>{reserve > 0 ? kg(reserve) : '—'}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          max={reste}
                          placeholder="0"
                          value={saisie[r.idRecolte] ?? ''}
                          onChange={(e) => setSaisie((s) => ({ ...s, [r.idRecolte]: e.target.value }))}
                          style={{
                            width: 130,
                            padding: 8,
                            borderRadius: 8,
                            border: '1px solid var(--bordure)',
                            background: 'var(--fond-carte)',
                            color: 'var(--texte)',
                          }}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-primary"
                          disabled={reste <= 0}
                          onClick={() => ajouterAuPanier(r)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 10px', fontSize: 13 }}
                        >
                          <Plus size={14} /> Ajouter
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {lignesCoop > 0 && (
            <p style={{ color: 'var(--texte-doux)', fontSize: 13 }}>
              {lignesCoop} récolte(s) de cette coopérative sont déjà dans le panier.
            </p>
          )}
        </>
      )}

      {message && <p style={{ color: 'var(--accent)', marginTop: 16 }}>{message}</p>}
      {erreur && <p style={{ color: '#ef4444', marginTop: 16 }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: 12, marginTop: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/panier"
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
        >
          <ShoppingBasket size={18} />
          Voir le panier ({lignes.length} ligne{lignes.length > 1 ? 's' : ''})
        </Link>
        <span style={{ color: 'var(--texte-doux)', fontSize: 13 }}>
          Ajoutez autant de produits que nécessaire, puis validez depuis le panier.
        </span>
      </div>
    </div>
  );
}