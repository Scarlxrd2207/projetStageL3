import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireRecolte from '../../components/FormulaireRecolte';
import type { ValeursRecolte } from '../../components/FormulaireRecolte';
import { getRecolte, modifierRecolte } from '../../services/recolte.service';
import type { DonneesRecolte, Recolte } from '../../services/recolte.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { getProduits } from '../../services/produit.service';
import type { Produit } from '../../services/produit.service';
import '../../styles/dashboard.css';

export default function ModifierRecolte() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [recolte, setRecolte] = useState<Recolte | null>(null);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [produits, setProduits] = useState<Produit[]>([]);
  const [erreurChargement, setErreurChargement] = useState('');

  useEffect(() => {
    if (!id) return;
    getRecolte(id)
      .then(setRecolte)
      .catch(() => setErreurChargement('Récolte introuvable'));
  }, [id]);

  useEffect(() => {
    getCooperativesFiltrees({}).then(setCooperatives).catch(() => {});
    getProduits().then(setProduits).catch(() => {});
  }, []);

  // Valeurs de départ, prises dans la récolte chargée
  const initial: ValeursRecolte | null = recolte
    ? {
        idCoop: recolte.idCoop,
        idMembre: recolte.idMembre,
        idProduit: recolte.idProduit,
        dateRecolte: recolte.dateRecolte,
        quantiteDeclaree: String(recolte.quantiteDeclaree),
      }
    : null;

  // Ce qui a déjà été commandé : la quantité déclarée ne peut pas descendre en dessous
  const dejaCommande = recolte ? recolte.quantiteDeclaree - recolte.quantiteRestante : 0;

  async function enregistrer(d: DonneesRecolte): Promise<string | null> {
    try {
      await modifierRecolte(id!, {
        dateRecolte: d.dateRecolte,
        quantiteDeclaree: d.quantiteDeclaree,
      });
      navigate('/recoltes');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Modification impossible';
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Modifier la récolte</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !initial && <p>Chargement...</p>}

          {initial && (
            <>
              {dejaCommande > 0 && (
                <p style={{ color: 'var(--texte-doux)' }}>
                  Déjà commandé : {dejaCommande} kg. La quantité déclarée ne peut pas descendre en dessous.
                </p>
              )}
              <FormulaireRecolte
                initial={initial}
                cooperatives={cooperatives}
                produits={produits}
                coopVerrouillee
                modeEdition
                libelleBouton="Enregistrer les modifications"
                onSubmit={enregistrer}
                onAnnuler={() => navigate('/recoltes')}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}