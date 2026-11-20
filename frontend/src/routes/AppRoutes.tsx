import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Connexion from '../views/AuthViews/connexion';
import DashboardResponsable from '../views/DashboardViews/dashboardResponsable';
import DashboardPresident from '../views/DashboardViews/dashboardPresident';
import ListeCoop from '../views/CoopViews/listeCoop';
import AjouterCoop from '../views/CoopViews/ajouterCoop';
import ModifierCoop from '../views/CoopViews/modifierCoop';
import AjouterPresident from '../views/CoopViews/ajouterPresident';
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
import SuiviLivraisons from '../views/LivraisonViews/suiviLivraisons';
import ListeConversations from '../views/MessageViews/listeConversations';
import Conversation from '../views/MessageViews/conversation';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Accueil et connexion */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Connexion />} />

        {/* Tableaux de bord */}
        <Route path="/dashboard/responsable" element={
          <ProtectedRoute roles={['RESPONSABLE']}><DashboardResponsable /></ProtectedRoute>
        } />
        <Route path="/dashboard/president" element={
          <ProtectedRoute roles={['PRESIDENT']}><DashboardPresident /></ProtectedRoute>
        } />

        {/* Coopératives (responsable) */}
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
        <Route path="/cooperatives/:id/membres" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ListeMembres /></ProtectedRoute>
        } />

        {/* Membres (président et responsable) */}
        <Route path="/membres" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ListeMembres /></ProtectedRoute>
        } />
        <Route path="/membres/ajouter" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><AjouterMembre /></ProtectedRoute>
        } />
        <Route path="/membres/:id/modifier" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ModifierMembre /></ProtectedRoute>
        } />

        {/* Produits (responsable) */}
        <Route path="/produits" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ListeProduits /></ProtectedRoute>
        } />
        <Route path="/produits/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><AjouterProduit /></ProtectedRoute>
        } />

        {/* Récoltes (président et responsable) */}
        <Route path="/recoltes" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ListeRecoltes /></ProtectedRoute>
        } />
        <Route path="/recoltes/ajouter" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><AjouterRecolte /></ProtectedRoute>
        } />
        <Route path="/recoltes/:id/modifier" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ModifierRecolte /></ProtectedRoute>
        } />

        {/* Stock (président et responsable) */}
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

        {/* Livraisons (président et responsable) */}
        <Route path="/livraisons" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><SuiviLivraisons /></ProtectedRoute>
        } />

        {/* Messages (président et responsable) */}
        <Route path="/messages" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ListeConversations /></ProtectedRoute>
        } />
        <Route path="/messages/:id" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Conversation /></ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}