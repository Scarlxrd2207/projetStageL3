import { Search, X } from 'lucide-react';

type Props = {
  texte: string;
  onTexte: (valeur: string) => void;
  placeholder?: string;
  avecDates?: boolean;
  du?: string;
  au?: string;
  onDu?: (valeur: string) => void;
  onAu?: (valeur: string) => void;
};

export default function BarreRecherche({
  texte,
  onTexte,
  placeholder = 'Rechercher…',
  avecDates = false,
  du = '',
  au = '',
  onDu,
  onAu,
}: Props) {
  const filtreActif = texte !== '' || du !== '' || au !== '';

  function reinitialiser() {
    onTexte('');
    onDu?.('');
    onAu?.('');
  }

  return (
    <div className="barre-recherche">
      <div className="champ-recherche">
        <span className="loupe">
          <Search size={16} />
        </span>
        <input
          value={texte}
          onChange={(e) => onTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>

      {avecDates && (
        <>
          <label className="champ-date">
            Du
            <input type="date" value={du} onChange={(e) => onDu?.(e.target.value)} />
          </label>
          <label className="champ-date">
            Au
            <input type="date" value={au} onChange={(e) => onAu?.(e.target.value)} />
          </label>
        </>
      )}

      {filtreActif && (
        <button type="button" className="bouton-icone" aria-label="Effacer les filtres" onClick={reinitialiser}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}