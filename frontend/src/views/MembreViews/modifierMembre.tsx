import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { getMembre, modifierMembre } from '../../services/membre.service';
import type { DonneesMembre, Membre } from '../../services/membre.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function ModifierMembre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const utilisateur: { role: string } | null = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  const [membre, setMembre] = useState<Membre | null>(null);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getMembre(id)
      .then(setMembre)
      .catch(() => setErreurChargement('Membre introuvable'));
  }, [id]);

  useEffect(() => {
    getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
  }, []);

  const retour = estPresident || !membre ? '/membres' : `/cooperatives/${membre.idCoop}/membres`;

  async function enregistrer(d: DonneesMembre): Promise<string | null> {
    try {
      await modifierMembre(id!, d);
      navigate(retour);
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
          <h1>Modifier le membre {id}</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !membre && <p>Chargement...</p>}
          {membre && (
            <FormulaireMembre
              initial={{
                nomMembre: membre.nomMembre,
                prenomMembre: membre.prenomMembre,
                telephoneMembre: membre.telephoneMembre ?? '',
                fokotanyMembre: membre.fokotanyMembre,
                idCoop: membre.idCoop,
              }}
              cooperatives={cooperatives}
              coopVerrouillee
              libelleBouton="Enregistrer les modifications"
              onSubmit={enregistrer}
              onAnnuler={() => navigate(retour)}
            />
          )}
        </section>
      </main>
    </div>
  );
}