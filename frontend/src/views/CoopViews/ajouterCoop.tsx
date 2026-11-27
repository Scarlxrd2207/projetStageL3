import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireCoop from '../../components/FormulaireCoop';
import { creerCooperative } from '../../services/cooperative.service';
import type { DonneesCooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function AjouterCoop() {
  const navigate = useNavigate();

  const initial: DonneesCooperative = {
    nomCoop: '',
    districtCoop: '',
    communeCoop: '',
    fokotanyCoop: '',
    dateAdhesion: new Date().toISOString().slice(0, 10),
  };

  async function enregistrer(d: DonneesCooperative): Promise<string | null> {
    try {
      await creerCooperative(d);
      navigate('/cooperatives');
      return null;
    } catch (err: any) {
      return err.response?.data?.message ?? 'Serveur inaccessible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Ajouter une coopérative</h1>
        </header>
        <section className="card">
          <FormulaireCoop
            initial={initial}
            libelleBouton="Enregistrer"
            onSubmit={enregistrer}
            onAnnuler={() => navigate('/cooperatives')}
          />
        </section>
      </main>
    </div>
  );
}