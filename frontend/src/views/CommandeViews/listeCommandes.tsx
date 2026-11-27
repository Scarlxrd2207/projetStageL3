import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import BarreRecherche from '../../components/BarreRecherche';
import { getCommandes } from '../../services/commande.service';
import type { Commande } from '../../services/commande.service';
import { lireSession } from '../../utils/session';
import { useMaj } from '../../hooks/useTempsReel';
import { contient, dansPeriode } from '../../utils/filtres';
import { formaterAr } from '../../utils/format';
import '../../styles/dashboard.css';

const LIBELLES: Record<Commande['statutCommande'], string> = {
  EN_ATTENTE: 'En attente',
  EN_COURS_LIVRAISON: 'En cours de livraison',
  LIVREE: 'Livrée',
  REFUSEE: 'Refusée',
};

const CLASSES: Record<Commande['statutCommande'], string> = {
  EN_ATTENTE: 'attente',
  EN_COURS_LIVRAISON: 'cours',
  LIVREE: 'livree',
  REFUSEE: 'refusee',
};

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${Number(n).toLocaleString('fr-FR')} kg`;
}

export default function ListeCommandes() {
  const navigate = useNavigate();
  const estPresident = lireSession()?.role === 'PRESIDENT';

  const [commandes, setCommandes] = useState<Commande[]>([]);
  const [texte, setTexte] = useState('');
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    getCommandes()
      .then((liste) => {
        setCommandes(liste);
        setErreur('');
      })
      .catch(() => setErreur('Impossible de charger les commandes'))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  // Rafraîchissement immédiat quand une commande change
  useMaj(charger);

  const affichees = useMemo(
    () =>
      commandes.filter(
        (c) =>
          contient(texte, [
            c.idCommande,
            c.nomCoop,
            c.emailResponsable,
            LIBELLES[c.statutCommande],
            c.statutPaiement === 'PAYE' ? 'payé' : 'non payé',
          ]) && dansPeriode(c.dateCommande, du, au)
      ),
    [commandes, texte, du, au]
  );

  // Total des commandes affichées (les refusées comptent pour 0)
  const totalAffiche = useMemo(
    () => affichees.reduce((somme, c) => somme + c.montantTotal, 0),
    [affichees]
  );

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 style={{ margin: 0 }}>{estPresident ? 'Commandes reçues' : 'Commandes'}</h1>
            {!estPresident && (
              <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)', fontSize: 13 }}>
                Pour passer une commande, ouvrez la page Stock et cliquez sur « Commander ».
              </p>
            )}
          </div>
        </header>

        <section className="card">
          <BarreRecherche
            texte={texte}
            onTexte={setTexte}
            placeholder="Rechercher par référence, coopérative, statut…"
            avecDates
            du={du}
            au={au}
            onDu={setDu}
            onAu={setAu}
          />
        </section>

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && !erreur && affichees.length === 0 && <p>Aucune commande trouvée.</p>}

          {affichees.length > 0 && (
            <>
              <table className="table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Date</th>
                    {!estPresident && <th>Coopérative</th>}
                    <th>Lignes</th>
                    <th>Quantité totale</th>
                    <th>Montant total</th>
                    <th>Statut</th>
                    <th>Paiement</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affichees.map((c) => (
                    <tr key={c.idCommande}>
                      <td>{c.idCommande}</td>
                      <td>{formaterDate(c.dateCommande)}</td>
                      {!estPresident && <td>{c.nomCoop}</td>}
                      <td>{c.nbLignes}</td>
                      <td>{formaterKg(c.quantiteTotale)}</td>
                      <td>
                        <strong>{formaterAr(c.montantTotal)}</strong>
                        {c.statutCommande === 'EN_ATTENTE' && (
                          <div style={{ fontSize: 11, color: 'var(--texte-doux)' }}>estimé</div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${CLASSES[c.statutCommande]}`}>{LIBELLES[c.statutCommande]}</span>
                      </td>
                      <td>{c.statutPaiement === 'PAYE' ? 'Payé' : 'Non payé'}</td>
                      <td>
                        <button type="button" style={boutonLien} onClick={() => navigate(`/commandes/${c.idCommande}`)}>
                          Détail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 16, textAlign: 'right', color: 'var(--texte-doux)' }}>
                Total des commandes affichées :{' '}
                <strong style={{ color: 'var(--texte)' }}>{formaterAr(totalAffiche)}</strong>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}