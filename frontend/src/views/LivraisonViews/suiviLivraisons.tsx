<<<<<<< HEAD
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
=======
import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import { getLivraisons, confirmerLivraison } from '../../services/livraison.service';
import type { Livraison } from '../../services/livraison.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

// Les dates arrivent en "AAAA-MM-JJ..." : on garde la partie date, affichée "JJ/MM/AAAA"
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
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
=======
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [chargement, setChargement] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!session) return;
    setChargement(true);
    getLivraisons(session.idUser, filtre || undefined)
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      .then((liste) => {
        setLivraisons(liste);
        setErreur('');
      })
<<<<<<< HEAD
      .catch((err: any) => setErreur(err?.response?.data?.message ?? 'Impossible de charger les livraisons'))
      .finally(() => setChargement(false));
  }, [filtre]);

  useEffect(() => {
    charger();
  }, [charger]);

  useMaj(charger);
=======
      .catch((err) => setErreur(err?.response?.data?.message ?? 'Impossible de charger les livraisons'))
      .finally(() => setChargement(false));
  }, [filtre, version]);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 3000);
    return () => clearTimeout(t);
  }, [message]);

<<<<<<< HEAD
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
=======
  async function confirmer(l: Livraison) {
    if (!session) return;
    if (!window.confirm(`Confirmer la réception de la commande de ${l.nomCoop} ?`)) return;
    setErreur('');
    try {
      await confirmerLivraison(l.idCommande, session.idUser);
      setMessage('Réception confirmée');
      setVersion((v) => v + 1);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Confirmation impossible');
    }
  }

  const select = {
<<<<<<< HEAD
    padding: 10,
=======
    padding: 8,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
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
=======
        <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="kpi-label">Statut</span>
          <select style={select} value={filtre} onChange={(e) => setFiltre(e.target.value)}>
            <option value="">Toutes</option>
            <option value="EN_COURS_LIVRAISON">En cours de livraison</option>
            <option value="LIVREE">Livrées</option>
          </select>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        </section>

        <section className="card">
          {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
          {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
          {chargement && <p>Chargement...</p>}
<<<<<<< HEAD
          {!chargement && !erreur && affichees.length === 0 && <p>Aucune livraison trouvée.</p>}

          {affichees.length > 0 && (
=======
          {!chargement && !erreur && livraisons.length === 0 && (
            <p>Aucune livraison en cours ou terminée.</p>
          )}

          {!chargement && livraisons.length > 0 && (
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
                {affichees.map((l) => (
=======
                {livraisons.map((l) => (
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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