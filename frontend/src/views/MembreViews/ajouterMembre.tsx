import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
=======
import { useNavigate, useSearchParams } from 'react-router-dom';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { creerMembre } from '../../services/membre.service';
import type { DonneesMembre } from '../../services/membre.service';
<<<<<<< HEAD
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
=======
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import '../../styles/dashboard.css';

export default function AjouterMembre() {
  const navigate = useNavigate();
<<<<<<< HEAD
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
=======
  const [params] = useSearchParams();
  const utilisateur = JSON.parse(localStorage.getItem('utilisateur') ?? 'null');
  const estPresident = utilisateur?.role === 'PRESIDENT';

  // président : sa coopérative est imposée ; responsable : celle de l'adresse, ou à choisir
  const coopInitiale: string = estPresident
    ? utilisateur.idCoop
    : (params.get('idCoop') ?? '');

  const retour = estPresident
    ? '/membres'
    : coopInitiale ? `/cooperatives/${coopInitiale}/membres` : '/membres';

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);

  useEffect(() => {
    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => {});
  }, []);

  async function enregistrer(d: DonneesMembre): Promise<string | null> {
    try {
      await creerMembre(d);
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
          <h1>Ajouter un membre</h1>
        </header>
        <section className="card">
<<<<<<< HEAD
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
=======
          <FormulaireMembre
            initial={{
              nomMembre: '',
              prenomMembre: '',
              telephoneMembre: '',
              fokotanyMembre: '',
              idCoop: coopInitiale,
            }}
            cooperatives={cooperatives}
            coopVerrouillee={estPresident}
            libelleBouton="Enregistrer"
            onSubmit={enregistrer}
            onAnnuler={() => navigate(retour)}
          />
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        </section>
      </main>
    </div>
  );
}