import { useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';

type Props = {
  nomCoop: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (d: { email: string; motDePasse: string }) => Promise<string | null>;
  onAnnuler: () => void;
};

export default function FormulairePresident({ nomCoop, onSubmit, onAnnuler }: Props) {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!email.trim()) {
      setErreur("L'adresse e-mail est obligatoire");
      return;
    }
    if (motDePasse.length < 6) {
      setErreur('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur('Les deux mots de passe ne sont pas identiques');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit({ email: email.trim(), motDePasse });
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { width: '100%', padding: 8, marginBottom: 14, boxSizing: 'border-box' };
  const lecture: CSSProperties = { ...input, background: 'var(--fond-side)', color: 'var(--texte-doux)' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 560 }}>
      <label style={label}>Coopérative</label>
      <input style={lecture} value={nomCoop} readOnly />

      <label style={label}>Adresse e-mail du président</label>
      <input style={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label style={label}>Mot de passe initial (6 caractères minimum)</label>
      <input style={input} type="password" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />

      <label style={label}>Confirmer le mot de passe</label>
      <input style={input} type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />

      {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn-primary" disabled={envoi}>
          {envoi ? 'Enregistrement...' : 'Créer le compte du président'}
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