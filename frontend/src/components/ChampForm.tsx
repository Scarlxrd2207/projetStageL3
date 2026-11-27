import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Props = {
  id: string;
  label: string;
  icone?: LucideIcon;
  obligatoire?: boolean;
  aide?: string;
  erreur?: string;
  pleine?: boolean;
  children: ReactNode;
};

// Un champ de formulaire : libellé, icône, saisie, aide ou message d'erreur
export default function ChampForm({ id, label, icone: Icone, obligatoire, aide, erreur, pleine, children }: Props) {
  return (
    <div className={`form-champ${pleine ? ' pleine' : ''}`}>
      <label className="form-label" htmlFor={id}>
        {label}
        {obligatoire && <span className="obligatoire">*</span>}
      </label>
      <div className={`form-entree${Icone ? ' avec-icone' : ''}`}>
        {Icone && <Icone size={16} />}
        {children}
      </div>
      {erreur ? (
        <span className="form-erreur-champ">{erreur}</span>
      ) : aide ? (
        <span className="form-aide">{aide}</span>
      ) : null}
    </div>
  );
}