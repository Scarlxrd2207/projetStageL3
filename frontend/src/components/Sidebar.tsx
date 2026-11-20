import { Link, useLocation, useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const menuResponsable = [
  { label: 'Tableau de bord', to: '/dashboard/responsable' },
  { label: 'Coopératives', to: '/cooperatives' },
  { label: 'Produits', to: '/produits' },
  { label: 'Membres', to: '/membres' },
  { label: 'Récoltes', to: '/recoltes' },
  { label: 'Stock', to: '/stock' },
  { label: 'Commandes', to: '/commandes' },
  { label: 'Livraisons', to: '/livraisons' },
  { label: 'Messages', to: '/messages' },
];

const menuPresident = [
  { label: 'Tableau de bord', to: '/dashboard/president' },
  { label: 'Membres', to: '/membres' },
  { label: 'Récoltes', to: '/recoltes' },
  { label: 'Stock', to: '/stock' },
  { label: 'Commandes reçues', to: '/commandes' },
  { label: 'Livraisons', to: '/livraisons' },
  { label: 'Messages', to: '/messages' },
];

// Lecture protégée : une valeur corrompue ne fait pas planter la barre latérale
function lireUtilisateur(): { role: string } | null {
  try {
    return JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  } catch {
    return null;
  }
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const utilisateur = lireUtilisateur();
  const menu = utilisateur?.role === 'PRESIDENT' ? menuPresident : menuResponsable;

  function deconnexion() {
    localStorage.removeItem('utilisateur');
    navigate('/login');
  }

  return (
    <aside className="sidebar">
      <div className="brand">SOAM</div>
      <div className="nav-section">Navigation</div>

      {menu.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`nav-item ${location.pathname.startsWith(item.to) ? 'active' : ''}`}
        >
          {item.label}
        </Link>
      ))}

      <ThemeToggle />
      <button className="logout" onClick={deconnexion}>Déconnexion</button>
    </aside>
  );
}