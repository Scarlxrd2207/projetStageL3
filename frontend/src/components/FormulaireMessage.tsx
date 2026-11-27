import { useState } from 'react';
import type { KeyboardEvent } from 'react';

const MAX = 500;

type Props = {
  // renvoie null si l'envoi a réussi, sinon le message d'erreur
  onEnvoyer: (contenu: string) => Promise<string | null>;
};

export default function FormulaireMessage({ onEnvoyer }: Props) {
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  async function envoyer() {
    const propre = texte.trim();
    if (!propre) return;

    setErreur('');
    setEnvoi(true);
    const message = await onEnvoyer(propre);
    if (message) setErreur(message);
    else setTexte('');
    setEnvoi(false);
  }

  // Entrée envoie, Maj + Entrée passe à la ligne
  function touche(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  return (
    <div>
      <textarea
        value={texte}
        onChange={(e) => setTexte(e.target.value)}
        onKeyDown={touche}
        maxLength={MAX}
        rows={2}
        placeholder="Écrire un message (Entrée pour envoyer, Maj + Entrée pour aller à la ligne)"
        style={{
          width: '100%',
          padding: 8,
          boxSizing: 'border-box',
          background: 'var(--fond-carte)',
          color: 'var(--texte)',
          border: '1px solid var(--bordure)',
          borderRadius: 8,
          resize: 'vertical',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <span style={{ color: 'var(--texte-doux)', fontSize: 12 }}>{texte.length}/{MAX}</span>
        <button
          type="button"
          className="btn-primary"
          disabled={envoi || !texte.trim()}
          onClick={envoyer}
        >
          {envoi ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>

      {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
    </div>
  );
}