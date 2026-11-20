import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireCoop from '../../components/FormulaireCoop';
import { getCooperative, modifierCooperative } from '../../services/cooperative.service';
import type { DonneesCooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function ModifierCoop() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<DonneesCooperative | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getCooperative(id)
      .then((c) =>
        setInitial({
          nomCoop: c.nomCoop,
          districtCoop: c.districtCoop,
          communeCoop: c.communeCoop,
          fokotanyCoop: c.fokotanyCoop,
          dateAdhesion: c.dateAdhesion,
        })
      )
      .catch(() => setErreurChargement('Coopérative introuvable'));
  }, [id]);

  async function enregistrer(d: DonneesCooperative): Promise<string | null> {
    try {
      await modifierCooperative(id!, d);
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
          <h1>Modifier la coopérative {id}</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !initial && <p>Chargement...</p>}
          {initial && (
            <FormulaireCoop
              initial={initial}
              libelleBouton="Enregistrer les modifications"
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/cooperatives')}
            />
          )}
        </section>
      </main>
    </div>
  );
}