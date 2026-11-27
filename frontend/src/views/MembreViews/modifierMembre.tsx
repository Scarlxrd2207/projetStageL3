import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { getMembre, modifierMembre } from '../../services/membre.service';
import type { DonneesMembre, Membre } from '../../services/membre.service';
<<<<<<< HEAD
import { getCooperative } from '../../services/cooperative.service';
=======
import { getCooperativesFiltrees } from '../../services/cooperative.service';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function ModifierMembre() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
<<<<<<< HEAD

  const [membre, setMembre] = useState<Membre | null>(null);
  const [coop, setCoop] = useState<Cooperative | null>(null);
=======
  const utilisateur: { role: string } | null = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  const [membre, setMembre] = useState<Membre | null>(null);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getMembre(id)
      .then(setMembre)
      .catch(() => setErreurChargement('Membre introuvable'));
  }, [id]);

<<<<<<< HEAD
  // La coopérative du membre sert à afficher son district et sa commune
  useEffect(() => {
    if (!membre) return;
    getCooperative(membre.idCoop)
      .then(setCoop)
      .catch(() => {});
  }, [membre]);
=======
  useEffect(() => {
    getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
  }, []);

  const retour = estPresident || !membre ? '/membres' : `/cooperatives/${membre.idCoop}/membres`;
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  async function enregistrer(d: DonneesMembre): Promise<string | null> {
    try {
      await modifierMembre(id!, d);
<<<<<<< HEAD
      navigate('/membres');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Serveur inaccessible';
=======
      navigate(retour);
      return null;
    } catch (err: any) {
      return err.response?.data?.message ?? 'Serveur inaccessible';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
<<<<<<< HEAD
          <h1>Modifier le membre</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && (!membre || !coop) && <p>Chargement...</p>}

          {membre && coop && (
=======
          <h1>Modifier le membre {id}</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !membre && <p>Chargement...</p>}
          {membre && (
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
            <FormulaireMembre
              initial={{
                nomMembre: membre.nomMembre,
                prenomMembre: membre.prenomMembre,
                telephoneMembre: membre.telephoneMembre ?? '',
                fokotanyMembre: membre.fokotanyMembre,
                idCoop: membre.idCoop,
              }}
<<<<<<< HEAD
              cooperatives={[coop]}
              coopVerrouillee
              libelleBouton="Enregistrer les modifications"
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/membres')}
=======
              cooperatives={cooperatives}
              coopVerrouillee
              libelleBouton="Enregistrer les modifications"
              onSubmit={enregistrer}
              onAnnuler={() => navigate(retour)}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
            />
          )}
        </section>
      </main>
    </div>
  );
}