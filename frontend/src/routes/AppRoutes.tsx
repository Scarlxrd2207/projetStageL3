import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Connexion from '../views/AuthViews/connexion';
import DashboardResponsable from '../views/DashboardViews/dashboardResponsable';
import DashboardPresident from '../views/DashboardViews/dashboardPresident';
<<<<<<< HEAD
import DashboardStatistiques from '../views/StatistiquesViews/dashboardStatistiques';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import ListeCoop from '../views/CoopViews/listeCoop';
import AjouterCoop from '../views/CoopViews/ajouterCoop';
import ModifierCoop from '../views/CoopViews/modifierCoop';
import AjouterPresident from '../views/CoopViews/ajouterPresident';
<<<<<<< HEAD
import GererPresidents from '../views/CoopViews/gererPresidents';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
import PanierPage from '../views/PanierViews/panier';
import SuiviLivraisons from '../views/LivraisonViews/suiviLivraisons';
import Messagerie from '../views/MessageViews/messagerie';
import ProfilPage from '../views/ProfilViews/profil';
=======
import SuiviLivraisons from '../views/LivraisonViews/suiviLivraisons';
import ListeConversations from '../views/MessageViews/listeConversations';
import Conversation from '../views/MessageViews/conversation';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Connexion />} />

        {/* Profil (les deux profils) */}
        <Route path="/profil" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ProfilPage /></ProtectedRoute>
        } />

=======
        {/* Accueil et connexion */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Connexion />} />

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        {/* Tableaux de bord */}
        <Route path="/dashboard/responsable" element={
          <ProtectedRoute roles={['RESPONSABLE']}><DashboardResponsable /></ProtectedRoute>
        } />
        <Route path="/dashboard/president" element={
          <ProtectedRoute roles={['PRESIDENT']}><DashboardPresident /></ProtectedRoute>
        } />

<<<<<<< HEAD
        {/* Statistiques : même écran pour les deux profils, données filtrées côté serveur */}
        <Route path="/statistiques" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><DashboardStatistiques /></ProtectedRoute>
        } />

        {/* Coopératives et présidents (responsable) */}
=======
        {/* Coopératives (responsable) */}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
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
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        } />

        {/* Produits (responsable) */}
        <Route path="/produits" element={
          <ProtectedRoute roles={['RESPONSABLE']}><ListeProduits /></ProtectedRoute>
        } />
        <Route path="/produits/ajouter" element={
          <ProtectedRoute roles={['RESPONSABLE']}><AjouterProduit /></ProtectedRoute>
        } />

<<<<<<< HEAD
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
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
        {/* Panier de commande (responsable) */}
        <Route path="/panier" element={
          <ProtectedRoute roles={['RESPONSABLE']}><PanierPage /></ProtectedRoute>
        } />

        {/* Livraisons */}
=======
        {/* Livraisons (président et responsable) */}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        <Route path="/livraisons" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><SuiviLivraisons /></ProtectedRoute>
        } />

<<<<<<< HEAD
        {/* Messages (une seule page : liste et discussion) */}
        <Route path="/messages" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Messagerie /></ProtectedRoute>
        } />
        <Route path="/messages/:id" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Messagerie /></ProtectedRoute>
        } />

        {/* Toute adresse inconnue renvoie vers la connexion */}
        <Route path="*" element={<Navigate to="/login" replace />} />
=======
        {/* Messages (président et responsable) */}
        <Route path="/messages" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><ListeConversations /></ProtectedRoute>
        } />
        <Route path="/messages/:id" element={
          <ProtectedRoute roles={['PRESIDENT', 'RESPONSABLE']}><Conversation /></ProtectedRoute>
        } />
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      </Routes>
    </BrowserRouter>
  );
}