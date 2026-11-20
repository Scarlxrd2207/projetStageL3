import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { Cooperative } from '../services/cooperative.service';
import type { Produit } from '../services/produit.service';
import { getMembres } from '../services/membre.service';
import type { Membre } from '../services/membre.service';
import type { DonneesRecolte } from '../services/recolte.service';
import { dateAujourdhui } from '../utils/dates';

export type ValeursRecolte = {
  idCoop: string;
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: string;
};

type Props = {
  initial: ValeursRecolte;
  cooperatives: Cooperative[];
  produits: Produit[];
  coopVerrouillee: boolean;
  modeEdition: boolean; // en modification : coopérative, membre et produit ne changent pas
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (d: DonneesRecolte) => Promise<string | null>;
  onAnnuler: () => void;
};

export default function FormulaireRecolte({
  initial,
  cooperatives,
  produits,
  coopVerrouillee,
  modeEdition,
  libelleBouton,
  onSubmit,
  onAnnuler,
}: Props) {
  const [form, setForm] = useState<ValeursRecolte>(initial);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const coop = cooperatives.find((c) => c.idCoop === form.idCoop);

  // Membres de la coopérative choisie (en modification, on garde aussi les inactifs)
  useEffect(() => {
    if (!form.idCoop) {
      setMembres([]);
      return;
    }
    getMembres(form.idCoop)
      .then((liste) => setMembres(modeEdition ? liste : liste.filter((m) => m.actifMembre === 'Oui')))
      .catch(() => setMembres([]));
  }, [form.idCoop, modeEdition]);

  function modifier(cle: keyof ValeursRecolte, valeur: string) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  // Changer de coopérative réinitialise le membre
  function changerCoop(id: string) {
    setForm((f) => ({ ...f, idCoop: id, idMembre: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    const quantite = Number(form.quantiteDeclaree.replace(',', '.'));

    if (!form.idCoop) {
      setErreur('Choisissez une coopérative');
      return;
    }
    if (!form.idMembre) {
      setErreur('Choisissez un membre');
      return;
    }
    if (!form.idProduit) {
      setErreur('Choisissez un produit');
      return;
    }
    if (!form.dateRecolte) {
      setErreur('La date de récolte est obligatoire');
      return;
    }
    if (form.dateRecolte > dateAujourdhui()) {
      setErreur('La date de récolte ne peut pas être dans le futur');
      return;
    }
    if (!(quantite > 0)) {
      setErreur('La quantité doit être supérieure à 0');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit({
      idMembre: form.idMembre,
      idProduit: form.idProduit,
      dateRecolte: form.dateRecolte,
      quantiteDeclaree: quantite,
    });
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { width: '100%', padding: 8, marginBottom: 14, boxSizing: 'border-box' };
  const lecture: CSSProperties = { ...input, background: 'var(--fond-side)', color: 'var(--texte-doux)' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 560 }}>
      <label style={label}>Coopérative</label>
      <select
        style={input}
        value={form.idCoop}
        disabled={coopVerrouillee || modeEdition}
        onChange={(e) => changerCoop(e.target.value)}
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop} ({c.idCoop})
          </option>
        ))}
      </select>

      <label style={label}>Membre producteur</label>
      <select
        style={input}
        value={form.idMembre}
        disabled={modeEdition || !form.idCoop}
        onChange={(e) => modifier('idMembre', e.target.value)}
      >
        <option value="">
          {form.idCoop ? '-- Choisir un membre --' : "-- Choisissez d'abord une coopérative --"}
        </option>
        {membres.map((m) => (
          <option key={m.idMembre} value={m.idMembre}>
            {m.prenomMembre} {m.nomMembre}
          </option>
        ))}
      </select>

      <label style={label}>Produit</label>
      <select
        style={input}
        value={form.idProduit}
        disabled={modeEdition}
        onChange={(e) => modifier('idProduit', e.target.value)}
      >
        <option value="">-- Choisir un produit --</option>
        {produits.map((p) => (
          <option key={p.idProduit} value={p.idProduit}>
            {p.nomProduit}
          </option>
        ))}
      </select>

      <label style={label}>District (selon la coopérative)</label>
      <input style={lecture} value={coop?.districtCoop ?? ''} readOnly />

      <label style={label}>Commune (selon la coopérative)</label>
      <input style={lecture} value={coop?.communeCoop ?? ''} readOnly />

      <label style={label}>Date de récolte</label>
      <input
        style={input}
        type="date"
        max={dateAujourdhui()}
        value={form.dateRecolte}
        onChange={(e) => modifier('dateRecolte', e.target.value)}
      />

      <label style={label}>Quantité récoltée (kg)</label>
      <input
        style={input}
        type="number"
        min="0"
        step="0.01"
        value={form.quantiteDeclaree}
        onChange={(e) => modifier('quantiteDeclaree', e.target.value)}
      />

      {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn-primary" disabled={envoi}>
          {envoi ? 'Enregistrement...' : libelleBouton}
        </button>
        <button
          type="button"
          onClick={onAnnuler}
          style={{
            background: 'none',
            border: '1px solid var(--bordure)',
            color: 'var(--texte-doux)',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}