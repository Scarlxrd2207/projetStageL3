import { Link } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import { usePanier } from '../context/PanierContext';
import { lireSession } from '../utils/session';

// Icône du panier avec le nombre de lignes, visible uniquement pour le responsable
export default function PanierBouton() {
  const { nombre } = usePanier();
  if (lireSession()?.role !== 'RESPONSABLE') return null;

  return (
    <Link
      to="/panier"
      className="bouton-icone"
      aria-label="Panier"
      title="Panier"
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
    >
      <ShoppingBasket size={20} />
      {nombre > 0 && <span className="cloche-badge">{nombre > 9 ? '9+' : nombre}</span>}
    </Link>
  );
}