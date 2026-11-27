import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { creerMembre } from '../../services/membre.service';
import type { DonneesMembre } from '../../services/membre.service';
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

export default function AjouterMembre() {
  const navigate = useNavigate();
  const session = lireSession();
  const idCoop = session?.idCoop ?? '';

  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!idCoop) {
      setErreurChargement('Aucune coopérative rattachée à ce compte');
      return;
    }
    getCooperative(idCoop)
      .then(setCoop)
      .catch((err: any) => setErreurChargement(err?.response?.data?.message ?? 'Coopérative introuvable'));
  }, [idCoop]);

  async function enregistrer(d: DonneesMembre): Promise<string | null> {
    try {
      await creerMembre({ ...d, idCoop });
      navigate('/membres');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Serveur inaccessible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Ajouter un membre</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !coop && <p>Chargement...</p>}
          {coop && (
            <FormulaireMembre
              initial={{
                nomMembre: '',
                prenomMembre: '',
                telephoneMembre: '',
                fokotanyMembre: '',
                idCoop,
              }}
              cooperatives={[coop]}
              coopVerrouillee
              libelleBouton="Enregistrer"
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/membres')}
            />
          )}
        </section>
      </main>
    </div>
  );
}