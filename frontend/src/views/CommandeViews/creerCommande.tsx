import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import FormulaireCommande from '../../components/FormulaireCommande';
import { usePanier } from '../../context/PanierContext';
=======
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireCommande from '../../components/FormulaireCommande';
import { creerCommande } from '../../services/commande.service';
import type { LigneSaisie } from '../../services/commande.service';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function CreerCommande() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [params] = useSearchParams();
  const { nombre } = usePanier();

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');
  const [chargement, setChargement] = useState(true);
=======
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  useEffect(() => {
    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
<<<<<<< HEAD
      .catch(() => setErreurChargement('Impossible de charger les coopératives'))
      .finally(() => setChargement(false));
  }, []);

=======
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

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Nouvelle commande</h1>
<<<<<<< HEAD
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/panier')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <ShoppingBasket size={18} /> Panier ({nombre})
          </button>
        </header>

        <section className="card">
          {chargement && <p>Chargement des coopératives…</p>}
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}

          {!chargement && !erreurChargement && cooperatives.length === 0 && (
            <p>Aucune coopérative inscrite. Inscrivez une coopérative avant de passer une commande.</p>
          )}

          {!chargement && cooperatives.length > 0 && (
            <FormulaireCommande
              cooperatives={cooperatives}
              initialCoop={params.get('idCoop') ?? ''}
              initialProduit={params.get('idProduit') ?? ''}
            />
          )}
=======
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          <FormulaireCommande
            cooperatives={cooperatives}
            onSubmit={enregistrer}
            onAnnuler={() => navigate('/commandes')}
          />
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        </section>
      </main>
    </div>
  );
}