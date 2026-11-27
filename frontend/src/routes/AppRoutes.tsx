import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Connexion from '../views/AuthViews/connexion';
import DashboardResponsable from '../views/DashboardViews/dashboardResponsable';
import DashboardPresident from '../views/DashboardViews/dashboardPresident';
import DashboardStatistiques from '../views/StatistiquesViews/dashboardStatistiques';
import ListeCoop from '../views/CoopViews/listeCoop';
import AjouterCoop from '../views/CoopViews/ajouterCoop';
import ModifierCoop from '../views/CoopViews/modifierCoop';
import AjouterPresident from '../views/CoopViews/ajouterPresident';
import GererPresidents from '../views/CoopViews/gererPresidents';
import ListeMembres from '../views/MembreViews/listeMembres';
import AjouterMembre from '../views/MembreViews/ajouterMembre';
import ModifierMembre from '../views/MembreViews/modifierMembre';
import ListeProduits from '../views/ProduitViews/listeProduits';
import AjouterProduit from '../views/ProduitViews/ajouterProduit';
import ListeRecoltes from '../views/RecolteViews/listeRecoltes';
import AjouterRecolte from '../views/RecolteViews/ajouterRecolte';
import ModifierRecolte from '../views/RecolteViews/modifierRecolte';
import StockCooperatives from '../views/StockViews/stockCooperatives';
import DetailStockPage from '../views/StockViews/detailStock';
import ListeCommandes from '../views/CommandeViews/listeCommandes';
import CreerCommande from '../views/CommandeViews/creerCommande';
import DetailCommandePage from '../views/CommandeViews/detailCommande';
import PanierPage from '../views/PanierViews/panier';
import SuiviLivraisons from '../views/LivraisonViews/suiviLivraisons';
import Messagerie from '../views/MessageViews/messagerie';
import ProfilPage from '../views/ProfilViews/profil';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Connexion />} />

        {/* Profil (les deux profils) */}
        <Route path="/profil" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ProfilPage /></ProtectedRoute>
        } />

        {/* Tableaux de bord */}
        <Route path="/dashboard/responsable" element={
          <ProtectedRoute roles={['RESPONSABLE']}><DashboardResponsable /></ProtectedRoute>
        } />
        <Route path="/dashboard/president" element={
          <ProtectedRoute roles={['PRESIDENT']}><DashboardPresident /></ProtectedRoute>
        } />

        {/* Statistiques : même écran pour les deux profils, données filtrées côté serveur */}
        <Route path="/statistiques" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><DashboardStatistiques /></ProtectedRoute>
        } />

        {/* Coopératives et présidents (responsable) */}
        <Route path="/cooperatives" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ListeCoop /></ProtectedRoute>
        } />
        <Route path="/cooperatives/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><AjouterCoop /></ProtectedRoute>
        } />
        <Route path="/cooperatives/:id/modifier" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ModifierCoop /></ProtectedRoute>
        } />
        <Route path="/cooperatives/:id/president/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><AjouterPresident /></ProtectedRoute>
        } />
        <Route path="/presidents" element={
          <ProtectedRoute roles={['RESPONSABLE']}><GererPresidents /></ProtectedRoute>
        } />

        {/* Membres (président) */}
        <Route path="/membres" element={
          <ProtectedRoute roles={['PRESIDENT']}><ListeMembres /></ProtectedRoute>
        } />
        <Route path="/membres/ajouter" element={
          <ProtectedRoute roles={['PRESIDENT']}><AjouterMembre /></ProtectedRoute>
        } />
        <Route path="/membres/:id/modifier" element={
          <ProtectedRoute roles={['PRESIDENT']}><ModifierMembre /></ProtectedRoute>
        } />

        {/* Produits (responsable) */}
        <Route path="/produits" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ListeProduits /></ProtectedRoute>
        } />
        <Route path="/produits/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><AjouterProduit /></ProtectedRoute>
        } />

        {/* Récoltes (président) */}
        <Route path="/recoltes" element={
          <ProtectedRoute roles={['PRESIDENT']}><ListeRecoltes /></ProtectedRoute>
        } />
        <Route path="/recoltes/ajouter" element={
          <ProtectedRoute roles={['PRESIDENT']}><AjouterRecolte /></ProtectedRoute>
        } />
        <Route path="/recoltes/:id/modifier" element={
          <ProtectedRoute roles={['PRESIDENT']}><ModifierRecolte /></ProtectedRoute>
        } />

        {/* Stock */}
        <Route path="/stock" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><StockCooperatives /></ProtectedRoute>
        } />
        <Route path="/stock/detail" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><DetailStockPage /></ProtectedRoute>
        } />

        {/* Commandes */}
        <Route path="/commandes" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ListeCommandes /></ProtectedRoute>
        } />
        <Route path="/commandes/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><CreerCommande /></ProtectedRoute>
        } />
        <Route path="/commandes/:id" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><DetailCommandePage /></ProtectedRoute>
        } />

        {/* Panier de commande (responsable) */}
        <Route path="/panier" element={
          <ProtectedRoute roles={['RESPONSABLE']}><PanierPage /></ProtectedRoute>
        } />

        {/* Livraisons */}
        <Route path="/livraisons" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><SuiviLivraisons /></ProtectedRoute>
        } />

        {/* Messages (une seule page : liste et discussion) */}
        <Route path="/messages" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Messagerie /></ProtectedRoute>
        } />
        <Route path="/messages/:id" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Messagerie /></ProtectedRoute>
        } />

        {/* Toute adresse inconnue renvoie vers la connexion */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}