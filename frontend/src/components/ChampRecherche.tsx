import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

type Props = {
  options: string[];
  value: string;
  onChange: (valeur: string) => void;
  placeholder?: string;
  disabled?: boolean;
  style?: CSSProperties;
};

// Minuscules et sans accents : "ialamarina" trouve "Ialamarina"
function normaliser(texte: string): string {
  return texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function ChampRecherche({ options, value, onChange, placeholder, disabled, style }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [recherche, setRecherche] = useState('');
  const conteneur = useRef<HTMLDivElement>(null);

  const resultats = useMemo(() => {
    const q = normaliser(recherche);
    return options.filter((o) => normaliser(o).includes(q));
  }, [options, recherche]);

  // ferme la liste quand on clique en dehors
  useEffect(() => {
    function surClic(e: MouseEvent) {
      if (conteneur.current && !conteneur.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', surClic);
    return () => document.removeEventListener('mousedown', surClic);
  }, []);

  function choisir(option: string) {
    onChange(option);
    setRecherche('');
    setOuvert(false);
  }

  return (
    <div ref={conteneur} style={{ position: 'relative', marginBottom: 14, ...style }}>
      <input
        value={ouvert ? recherche : value}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => { setOuvert(true); setRecherche(''); }}
        onChange={(e) => { setRecherche(e.target.value); setOuvert(true); }}
        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
      />

      {ouvert && !disabled && (
        <ul
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            margin: 0, padding: 4, listStyle: 'none', maxHeight: 220, overflowY: 'auto',
            background: 'var(--fond-carte)', border: '1px solid var(--bordure)', borderRadius: 8,
          }}
        >
          {resultats.length === 0 && (
            <li style={{ padding: 8, color: 'var(--texte-doux)' }}>Aucun résultat</li>
          )}
          {resultats.map((o) => (
            <li
              key={o}
              onMouseDown={() => choisir(o)}
              style={{
                padding: 8, cursor: 'pointer', borderRadius: 6,
                background: o === value ? 'var(--actif)' : 'transparent',
              }}
            >
              {o}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}