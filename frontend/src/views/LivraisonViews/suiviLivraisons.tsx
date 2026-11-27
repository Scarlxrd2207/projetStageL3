import { useCallback, useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import BarreRecherche from '../../components/BarreRecherche';
import { getLivraisons, confirmerLivraison } from '../../services/livraison.service';
import type { Livraison } from '../../services/livraison.service';
import { lireSession } from '../../utils/session';
import { useMaj } from '../../hooks/useTempsReel';
import { contient, dansPeriode } from '../../utils/filtres';
import '../../styles/dashboard.css';

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

function formaterKg(n: number): string {
  return `${n.toLocaleString('fr-FR')} kg`;
}

export default function SuiviLivraisons() {
  const session = lireSession();
  const estResponsable = session?.role === 'RESPONSABLE';

  const [livraisons, setLivraisons] = useState<Livraison[]>([]);
  const [filtre, setFiltre] = useState('');
  const [texte, setTexte] = useState('');
  const [du, setDu] = useState('');
  const [au, setAu] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);

  const charger = useCallback(() => {
    const idUser = lireSession()?.idUser ?? '';
    setChargement(true);
    getLivraisons(idUser, filtre || undefined)
      .then((liste) => {
        setLivraisons(liste);
        setErreur('');
      })
      .catch((err: any) => setErreur(err?.response?.data?.message ?? 'Impossible de charger les livraisons'))
      .finally(() => setChargement(false));
  }, [filtre]);

  useEffect(() => {
    charger();
  }, [charger]);

  useMaj(charger);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

  const affichees = livraisons.filter(
    (l) =>
      contient(texte, [l.idCommande, l.nomCoop, l.statutCommande === 'LIVREE' ? 'livrée' : 'en cours']) &&
      dansPeriode(l.dateAcceptation, du, au)
  );

  async function confirmer(l: Livraison) {
    const idUser = lireSession()?.idUser ?? '';
    if (!window.confirm(`Confirmer la réception de la commande de ${l.nomCoop} ?`)) return;
    setErreur('');
    try {
      await confirmerLivraison(l.idCommande, idUser);
      setMessage('Réception confirmée');
      charger();
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Confirmation impossible');
    }
  }

  const select = {
    padding: 10,
    minWidth: 220,
    background: 'var(--fond-carte)',
    color: 'var(--texte)',
    border: '1px solid var(--bordure)',
    borderRadius: 8,
  };

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
          <h1>{estResponsable ? 'Livraisons' : 'Livraisons de ma coopérative'}</h1>
        </header>

        <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div className="kpi-label">Statut</div>
            <select style={select} value={filtre} onChange={(e) => setFiltre(e.target.value)}>
              <option value="">Toutes</option>
              <option value="EN_COURS_LIVRAISON">En cours de livraison</option>
              <option value="LIVREE">Livrées</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 300 }}>
            <BarreRecherche
              texte={texte}
              onTexte={setTexte}
              placeholder="Rechercher par référence ou coopérative…"
              avecDates
              du={du}
              au={au}
              onDu={setDu}
              onAu={setAu}
            />
          </div>
        </section>

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
          {chargement && <p>Chargement...</p>}
          {!chargement && !erreur && affichees.length === 0 && <p>Aucune livraison trouvée.</p>}

          {affichees.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Acceptée le</th>
                  {estResponsable && <th>Coopérative</th>}
                  <th>Lignes</th>
                  <th>Quantité livrée</th>
                  <th>Statut</th>
                  <th>Livrée le</th>
                  <th>Paiement</th>
                  {estResponsable && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {affichees.map((l) => (
                  <tr key={l.idCommande}>
                    <td>{formaterDate(l.dateAcceptation)}</td>
                    {estResponsable && <td>{l.nomCoop}</td>}
                    <td>{l.nbLignes}</td>
                    <td>{formaterKg(l.quantiteLivree)}</td>
                    <td>
                      <span className={`badge ${l.statutCommande === 'LIVREE' ? 'livree' : 'cours'}`}>
                        {l.statutCommande === 'LIVREE' ? 'Livrée' : 'En cours'}
                      </span>
                    </td>
                    <td>{formaterDate(l.dateLivraison)}</td>
                    <td>{l.statutPaiement === 'PAYE' ? 'Payé' : 'Non payé'}</td>
                    {estResponsable && (
                      <td>
                        {l.statutCommande === 'EN_COURS_LIVRAISON' ? (
                          <button type="button" style={boutonLien} onClick={() => confirmer(l)}>
                            Confirmer la réception
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}