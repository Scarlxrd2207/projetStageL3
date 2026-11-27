import { useEffect, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { getSocket } from '../services/socket';
import type { Maj } from '../services/socket';
import { lireSession } from '../utils/session';

// Bandeau d'alerte en temps réel : apparaît dès qu'une transformation fait passer
// le stock central sous le seuil, puis disparaît après 8 secondes.
export default function AlerteStock() {
  const [texte, setTexte] = useState('');

  useEffect(() => {
    if (lireSession()?.role !== 'RESPONSABLE') return;
    const s = getSocket();
    if (!s) return;

    const ecouteur = (m: Maj) => {
      if (m.type === 'stock' && m.message) setTexte(m.message);
    };
    s.on('maj', ecouteur);
    return () => {
      s.off('maj', ecouteur);
    };
  }, []);

  useEffect(() => {
    if (!texte) return;
    const t = setTimeout(() => setTexte(''), 8000);
    return () => clearTimeout(t);
  }, [texte]);

  if (!texte) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 80,
        right: 16,
        zIndex: 95,
        maxWidth: 420,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        borderRadius: 12,
        background: '#facc15',
        color: '#1c1917',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
        fontWeight: 600,
      }}
    >
      <AlertTriangle size={20} />
      <span style={{ flex: 1 }}>{texte}</span>
      <button
        type="button"
        aria-label="Fermer l'alerte"
        onClick={() => setTexte('')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1c1917' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}