import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMembre from '../../components/FormulaireMembre';
import { creerMembre } from '../../services/membre.service';
import type { DonneesMembre } from '../../services/membre.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function AjouterMembre() {
  const navigate = useNavigate();
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
        </section>
      </main>
    </div>
  );
}