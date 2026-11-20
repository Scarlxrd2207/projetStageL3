import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

type Props = {
  initialNom: string;
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (nom: string) => Promise<string | null>;
  onAnnuler: () => void;
};

export default function FormulaireProduit({ initialNom, libelleBouton, onSubmit, onAnnuler }: Props) {
  const [nom, setNom] = useState(initialNom);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!nom.trim()) {
      setErreur('Le nom du produit est obligatoire');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit(nom.trim());
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { width: '100%', padding: 8, marginBottom: 14, boxSizing: 'border-box' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 560 }}>
      <label style={label}>Nom du produit</label>
      <input
        style={input}
        value={nom}
        onChange={(e) => setNom(e.target.value)}
        placeholder="Ex. Maïs, Riz, Café"
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