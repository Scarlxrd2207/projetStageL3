import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { getMembre, modifierMembre } from '../../services/membre.service';
import type { DonneesMembre, Membre } from '../../services/membre.service';
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function ModifierMembre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [membre, setMembre] = useState<Membre | null>(null);
  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getMembre(id)
      .then(setMembre)
      .catch(() => setErreurChargement('Membre introuvable'));
  }, [id]);

  // La coopérative du membre sert à afficher son district et sa commune
  useEffect(() => {
    if (!membre) return;
    getCooperative(membre.idCoop)
      .then(setCoop)
      .catch(() => {});
  }, [membre]);

  async function enregistrer(d: DonneesMembre): Promise<string | null> {
    try {
      await modifierMembre(id!, d);
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
          <h1>Modifier le membre</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && (!membre || !coop) && <p>Chargement...</p>}

          {membre && coop && (
            <FormulaireMembre
              initial={{
                nomMembre: membre.nomMembre,
                prenomMembre: membre.prenomMembre,
                telephoneMembre: membre.telephoneMembre ?? '',
                fokotanyMembre: membre.fokotanyMembre,
                idCoop: membre.idCoop,
              }}
              cooperatives={[coop]}
              coopVerrouillee
              libelleBouton="Enregistrer les modifications"
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/membres')}
            />
          )}
        </section>
      </main>
    </div>
  );
}