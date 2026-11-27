<<<<<<< HEAD
import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UserCog,
  Wheat,
  Warehouse,
  ShoppingCart,
  Truck,
  MessageSquare,
  Users,
  Sprout,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ClocheNotifications from './ClocheNotifications';
import PanierBouton from './PanierBouton';
import { lireSession } from '../utils/session';
import { getCompteurs } from '../services/notification.service';
import type { Compteurs } from '../services/notification.service';
import { useMaj } from '../hooks/useTempsReel';
import { lireVus, ecrireVus } from '../utils/vu';
import type { Vus } from '../utils/vu';
import { useLangue } from '../context/LangueContext';
import '../styles/tiroir.css';

type Element = {
  cle: string;
  to: string;
  Icone: LucideIcon;
  compteur?: keyof Compteurs;
};

// Menu du responsable : Statistiques avant Présidents, qui est en dernier
const menuResponsable: Element[] = [
  { cle: 'menu.tableau', to: '/dashboard/responsable', Icone: LayoutDashboard },
  { cle: 'menu.cooperatives', to: '/cooperatives', Icone: Building2 },
  { cle: 'menu.produits', to: '/produits', Icone: Wheat },
  { cle: 'menu.stock', to: '/stock', Icone: Warehouse },
  { cle: 'menu.commandes', to: '/commandes', Icone: ShoppingCart, compteur: 'commandes' },
  { cle: 'menu.livraisons', to: '/livraisons', Icone: Truck, compteur: 'livraisons' },
  { cle: 'menu.messages', to: '/messages', Icone: MessageSquare, compteur: 'messages' },
  { cle: 'menu.statistiques', to: '/statistiques', Icone: BarChart3 },
  { cle: 'menu.presidents', to: '/presidents', Icone: UserCog },
];

// Menu du président (inchangé)
const menuPresident: Element[] = [
  { cle: 'menu.tableau', to: '/dashboard/president', Icone: LayoutDashboard },
  { cle: 'menu.membres', to: '/membres', Icone: Users },
  { cle: 'menu.recoltes', to: '/recoltes', Icone: Sprout },
  { cle: 'menu.statistiques', to: '/statistiques', Icone: BarChart3 },
  { cle: 'menu.stock', to: '/stock', Icone: Warehouse },
  { cle: 'menu.commandesRecues', to: '/commandes', Icone: ShoppingCart, compteur: 'commandes' },
  { cle: 'menu.livraisons', to: '/livraisons', Icone: Truck, compteur: 'livraisons' },
  { cle: 'menu.messages', to: '/messages', Icone: MessageSquare, compteur: 'messages' },
];

// Commandes et livraisons : compteur suivi par le navigateur.
// Messages : compteur suivi par le serveur (pas de filtre local).
const CLES_LOCALES: Array<keyof Compteurs> = ['commandes', 'livraisons'];

export default function Sidebar() {
  const location = useLocation();
  const { t } = useLangue();
  const session = lireSession();
  const idUser = session?.idUser ?? '';
  const estPresident = session?.role === 'PRESIDENT';
  const liste = estPresident ? menuPresident : menuResponsable;
  const initiale = session ? session.email.charAt(0).toUpperCase() : '?';
  const libelleRole = estPresident
    ? `${t('role.president')} · ${session?.nomCoop ?? session?.idCoop ?? ''}`
    : t('role.responsable');

  const [ouvert, setOuvert] = useState(false);
  const [compteurs, setCompteurs] = useState<Compteurs>({ commandes: 0, messages: 0, livraisons: 0 });
  const [vus, setVus] = useState<Vus>(() => lireVus(idUser));

  const charger = useCallback(() => {
    getCompteurs().then(setCompteurs).catch(() => {});
  }, []);

  useEffect(() => {
    charger();
    const minuterie = setInterval(charger, 30000);
    window.addEventListener('focus', charger);
    return () => {
      clearInterval(minuterie);
      window.removeEventListener('focus', charger);
    };
  }, [charger]);

  useMaj(charger);

  useEffect(() => {
    setOuvert(false);
  }, [location.pathname]);

  useEffect(() => {
    const touche = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOuvert(false);
    };
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, []);

  useEffect(() => {
    const actif = liste.find((i) => i.compteur && location.pathname.startsWith(i.to));
    const suivant: Vus = { ...lireVus(idUser) };
    let change = false;

    for (const cle of CLES_LOCALES) {
      const courant = compteurs[cle];
      const vu = suivant[cle] ?? 0;
      const consultee = actif?.compteur === cle;
      if ((consultee && vu !== courant) || vu > courant) {
        suivant[cle] = courant;
        change = true;
      }
    }

    if (change) {
      ecrireVus(idUser, suivant);
      setVus(suivant);
    }
  }, [location.pathname, compteurs, idUser, estPresident]);

  function pastille(cle?: keyof Compteurs): number {
    if (!cle) return 0;
    if (cle === 'messages') return compteurs.messages;
    return Math.max(0, compteurs[cle] - (vus[cle] ?? 0));
  }

  const elementActif = liste.find((i) => location.pathname.startsWith(i.to));
  const titre = location.pathname.startsWith('/profil')
    ? t('menu.profil')
    : location.pathname.startsWith('/panier')
      ? 'Panier'
      : elementActif
        ? t(elementActif.cle)
        : 'SOAM';

  return (
    <>
      <header className="barre">
        <button
          type="button"
          className="bouton-icone"
          aria-label={ouvert ? t('menu.replier') : t('menu.ouvrir')}
          onClick={() => setOuvert((o) => !o)}
        >
          {ouvert ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="barre-titre">{titre}</span>
        <span className="barre-espace" />
        <PanierBouton />
        <ClocheNotifications />
      </header>

      {ouvert && <div className="overlay" onClick={() => setOuvert(false)} />}

      <aside className={`tiroir ${ouvert ? 'ouvert' : ''}`}>
        {ouvert && <div className="nav-section">{t('menu.navigation')}</div>}

        <nav>
          {liste.map((item) => {
            const n = pastille(item.compteur);
            const actif = location.pathname.startsWith(item.to);
            const Icone = item.Icone;
            const libelle = t(item.cle);
            return (
              <Link key={item.to} to={item.to} title={libelle} className={`nav-item ${actif ? 'actif' : ''}`}>
                <span className="icone">
                  <Icone size={18} />
                </span>
                <span className="libelle">{libelle}</span>
                {n > 0 && <span className="pastille">{n > 9 ? '9+' : n}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="tiroir-pied">
          <Link
            to="/profil"
            title={t('menu.profil')}
            className={`profil-carte ${location.pathname === '/profil' ? 'actif' : ''}`}
          >
            <span className="avatar-wrap">
              <span className="avatar">{initiale}</span>
              <span className="point-vert" />
            </span>
            <span className="profil-texte">
              <strong>{session?.email}</strong>
              <small>{libelleRole}</small>
            </span>
          </Link>
        </div>
      </aside>
    </>
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  );
}