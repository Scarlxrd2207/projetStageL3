import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { DonneesCooperative } from '../services/cooperative.service';
import { NOMS_DISTRICTS, communesDe } from '../utils/localites';
import ChampRecherche from './ChampRecherche';

type Props = {
  initial: DonneesCooperative;
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (d: DonneesCooperative) => Promise<string | null>;
  onAnnuler: () => void;
};

export default function FormulaireCoop({ initial, libelleBouton, onSubmit, onAnnuler }: Props) {
  const [form, setForm] = useState<DonneesCooperative>(initial);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function modifier(cle: keyof DonneesCooperative, valeur: string) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  // changer de district vide la commune, qui doit appartenir au nouveau district
  function changerDistrict(district: string) {
    setForm((f) => ({ ...f, districtCoop: district, communeCoop: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!communesDe(form.districtCoop).includes(form.communeCoop)) {
      setErreur('Choisissez une commune dans la liste du district');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit(form);
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { width: '100%', padding: 8, marginBottom: 14, boxSizing: 'border-box' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <label style={label}>Nom de la coopérative</label>
      <input
        style={input}
        value={form.nomCoop}
        onChange={(e) => modifier('nomCoop', e.target.value)}
        required
      />

      <label style={label}>District</label>
      <ChampRecherche
        options={NOMS_DISTRICTS}
        value={form.districtCoop}
        onChange={changerDistrict}
        placeholder="Rechercher un district"
      />

      <label style={label}>Commune</label>
      <ChampRecherche
        options={communesDe(form.districtCoop)}
        value={form.communeCoop}
        onChange={(v) => modifier('communeCoop', v)}
        placeholder={form.districtCoop ? 'Rechercher une commune' : "Choisissez d'abord un district"}
        disabled={!form.districtCoop}
      />

      <label style={label}>Fokontany</label>
      <input
        style={input}
        value={form.fokotanyCoop}
        onChange={(e) => modifier('fokotanyCoop', e.target.value)}
        required
      />

      <label style={label}>Date d'adhésion</label>
      <input
        style={input}
        type="date"
        value={form.dateAdhesion}
        onChange={(e) => modifier('dateAdhesion', e.target.value)}
        required
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
            background: 'none', border: '1px solid var(--bordure)',
            color: 'var(--texte-doux)', padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
          }}
        >
          Annuler
        </button>
      </div>
    </form>
  );
}