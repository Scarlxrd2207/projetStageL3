import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireCommande from '../../components/FormulaireCommande';
import { creerCommande } from '../../services/commande.service';
import type { LigneSaisie } from '../../services/commande.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function CreerCommande() {
  const navigate = useNavigate();
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => setErreurChargement('Impossible de charger les coopératives'));
  }, []);

  async function enregistrer(idCoop: string, lignes: LigneSaisie[]): Promise<string | null> {
    try {
      await creerCommande(idCoop, lignes);
      navigate('/commandes');
      return null;
    } catch (err: any) {
      // message du serveur, ou message du frontend (session incomplète), ou message par défaut
      return err?.response?.data?.message ?? err?.message ?? 'Création impossible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Nouvelle commande</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          <FormulaireCommande
            cooperatives={cooperatives}
            onSubmit={enregistrer}
            onAnnuler={() => navigate('/commandes')}
          />
        </section>
      </main>
    </div>
  );
}