import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireProduit from '../../components/FormulaireProduit';
import { creerProduit } from '../../services/produit.service';
import '../../styles/dashboard.css';

export default function AjouterProduit() {
  const navigate = useNavigate();

  async function enregistrer(nom: string): Promise<string | null> {
    try {
      await creerProduit(nom);
      navigate('/produits');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Ajout impossible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Ajouter un produit</h1>
        </header>
        <section className="card">
          <FormulaireProduit
            initialNom=""
            libelleBouton="Enregistrer"
            onSubmit={enregistrer}
            onAnnuler={() => navigate('/produits')}
          />
        </section>
      </main>
    </div>
  );
}