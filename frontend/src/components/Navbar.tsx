import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const stocke = localStorage.getItem('utilisateur');
  const utilisateur = stocke ? JSON.parse(stocke) : null;

  function deconnexion() {
    localStorage.removeItem('utilisateur');
    navigate('/login');
  }

  return (
    <nav style={{ display: 'flex', gap: 16, padding: 12, background: '#1F4E79' }}>
      <strong style={{ color: 'white' }}>SOAM</strong>

      {utilisateur?.role === 'RESPONSABLE' && (
        <>
          <Link to="/cooperatives" style={{ color: 'white' }}>Coopératives</Link>
          <Link to="/commandes" style={{ color: 'white' }}>Commandes</Link>
          <Link to="/stock" style={{ color: 'white' }}>Stock</Link>
          <Link to="/livraisons" style={{ color: 'white' }}>Livraisons</Link>
        </>
      )}

      {utilisateur?.role === 'PRESIDENT' && (
        <>
          <Link to="/membres" style={{ color: 'white' }}>Membres</Link>
          <Link to="/recoltes" style={{ color: 'white' }}>Récoltes</Link>
          <Link to="/stock" style={{ color: 'white' }}>Stock</Link>
          <Link to="/commandes" style={{ color: 'white' }}>Commandes reçues</Link>
          <Link to="/livraisons" style={{ color: 'white' }}>Livraisons</Link>
        </>
      )}

      {utilisateur && (
        <>
          <Link to="/messages" style={{ color: 'white' }}>Messages</Link>
          <button onClick={deconnexion} style={{ marginLeft: 'auto' }}>Déconnexion</button>
        </>
      )}
    </nav>
  );
}