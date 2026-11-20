import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { Cooperative } from '../services/cooperative.service';
import type { DonneesMembre } from '../services/membre.service';

type Props = {
  initial: DonneesMembre;
  cooperatives: Cooperative[];
  coopVerrouillee: boolean;
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (d: DonneesMembre) => Promise<string | null>;
  onAnnuler: () => void;
};

export default function FormulaireMembre({
  initial,
  cooperatives,
  coopVerrouillee,
  libelleBouton,
  onSubmit,
  onAnnuler,
}: Props) {
  const [form, setForm] = useState<DonneesMembre>(initial);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // district et commune viennent de la coopérative : jamais saisis
  const coop = cooperatives.find((c) => c.idCoop === form.idCoop);

  function modifier(cle: keyof DonneesMembre, valeur: string) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!form.idCoop) {
      setErreur('Choisissez une coopérative');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit(form);
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = {
    width: '100%',
    padding: 8,
    marginBottom: 14,
    boxSizing: 'border-box',
  };

  const lecture: CSSProperties = {
    ...input,
    background: 'var(--fond-side)',
    color: 'var(--texte-doux)',
  };

  const label: CSSProperties = {
    display: 'block',
    marginBottom: 4,
    color: 'var(--texte-doux)',
    fontSize: 13,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <label style={label}>Coopérative</label>
      <select
        style={input}
        value={form.idCoop}
        disabled={coopVerrouillee}
        onChange={(e) => modifier('idCoop', e.target.value)}
        required
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop} ({c.idCoop})
          </option>
        ))}
      </select>

      <label style={label}>District (selon la coopérative)</label>
      <input style={lecture} value={coop?.districtCoop ?? ''} readOnly />

      <label style={label}>Commune (selon la coopérative)</label>
      <input style={lecture} value={coop?.communeCoop ?? ''} readOnly />

      <label style={label}>Nom</label>
      <input
        style={input}
        value={form.nomMembre}
        onChange={(e) => modifier('nomMembre', e.target.value)}
        required
      />

      <label style={label}>Prénom</label>
      <input
        style={input}
        value={form.prenomMembre}
        onChange={(e) => modifier('prenomMembre', e.target.value)}
        required
      />

      <label style={label}>Téléphone</label>
      <input
        style={input}
        type="tel"
        value={form.telephoneMembre}
        onChange={(e) => modifier('telephoneMembre', e.target.value)}
      />

      <label style={label}>Fokontany</label>
      <input
        style={input}
        value={form.fokotanyMembre}
        onChange={(e) => modifier('fokotanyMembre', e.target.value)}
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