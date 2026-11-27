import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import FormulaireCommande from '../../components/FormulaireCommande';
import { usePanier } from '../../context/PanierContext';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import '../../styles/dashboard.css';

export default function CreerCommande() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { nombre } = usePanier();

  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => setErreurChargement('Impossible de charger les coopératives'))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Nouvelle commande</h1>
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
        </section>
      </main>
    </div>
  );
}