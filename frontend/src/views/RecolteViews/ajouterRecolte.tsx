import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireRecolte from '../../components/FormulaireRecolte';
import type { ValeursRecolte } from '../../components/FormulaireRecolte';
import { creerRecolte } from '../../services/recolte.service';
import type { DonneesRecolte } from '../../services/recolte.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { getProduits } from '../../services/produit.service';
import type { Produit } from '../../services/produit.service';
import { dateAujourdhui } from '../../utils/dates';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

export default function AjouterRecolte() {
  const navigate = useNavigate();
  const session = lireSession();
  const estPresident = session?.role === 'PRESIDENT';

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);

  useEffect(() => {
    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => {});
    getProduits().then(setProduits).catch(() => {});
  }, []);

  // Président : sa coopérative est imposée. Responsable : il la choisit.
  const initial: ValeursRecolte = {
    idCoop: estPresident ? (session?.idCoop ?? '') : '',
    idMembre: '',
    idProduit: '',
    dateRecolte: dateAujourdhui(),
    quantiteDeclaree: '',
  };

  async function enregistrer(d: DonneesRecolte): Promise<string | null> {
    try {
      await creerRecolte(d);
      navigate('/recoltes');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Ajout impossible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Ajouter une récolte</h1>
        </header>
        <section className="card">
          <FormulaireRecolte
            initial={initial}
            cooperatives={cooperatives}
            produits={produits}
            coopVerrouillee={estPresident}
            modeEdition={false}
            libelleBouton="Enregistrer"
            onSubmit={enregistrer}
            onAnnuler={() => navigate('/recoltes')}
          />
        </section>
      </main>
    </div>
  );
}