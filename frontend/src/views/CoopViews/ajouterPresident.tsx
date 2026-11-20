import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulairePresident from '../../components/FormulairePresident';
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { creerPresident } from '../../services/utilisateur.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

export default function AjouterPresident() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = lireSession();

  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getCooperative(id)
      .then(setCoop)
      .catch(() => setErreurChargement('Coopérative introuvable'));
  }, [id]);

  async function enregistrer(d: { email: string; motDePasse: string }): Promise<string | null> {
    if (!session || !id) return 'Session incomplète, reconnectez-vous';
    try {
      await creerPresident(session.idUser, { ...d, idCoop: id });
      navigate('/cooperatives');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Création impossible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Compte du président</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !coop && <p>Chargement...</p>}
          {coop && (
            <FormulairePresident
              nomCoop={`${coop.nomCoop} (${coop.idCoop})`}
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/cooperatives')}
            />
          )}
        </section>
      </main>
    </div>
  );
}