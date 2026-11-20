import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getConversations, ouvrirConversation } from '../../services/message.service';
import type { ConversationListe } from '../../services/message.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

export default function ListeConversations() {
  const navigate = useNavigate();
  const session = lireSession();
  const estPresident = session?.role === 'PRESIDENT';

  const [conversations, setConversations] = useState<ConversationListe[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [choix, setChoix] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    if (!session) return;

    if (estPresident) {
      // le président va directement à la conversation de sa coopérative
      ouvrirConversation(session.idUser)
        .then((r) => navigate(`/messages/${r.idConversation}`, { replace: true }))
        .catch((err) => {
          setErreur(err?.response?.data?.message ?? 'Impossible d\'ouvrir la messagerie');
          setChargement(false);
        });
      return;
    }

    getConversations(session.idUser)
      .then(setConversations)
      .catch(() => setErreur('Impossible de charger les conversations'))
      .finally(() => setChargement(false));

    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => {});
  }, []);

  async function ouvrir(idCoop: string) {
    if (!session) return;
    setErreur('');
    try {
      const r = await ouvrirConversation(session.idUser, idCoop);
      navigate(`/messages/${r.idConversation}`);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Ouverture impossible');
    }
  }

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '6px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
  };

  const select = {
    padding: 8,
    minWidth: 240,
    background: 'var(--fond-carte)',
    color: 'var(--texte)',
    border: '1px solid var(--bordure)',
    borderRadius: 8,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>Messages</h1>
        </header>

        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {!estPresident && (
          <>
            <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span className="kpi-label">Nouvelle conversation avec</span>
              <select style={select} value={choix} onChange={(e) => setChoix(e.target.value)}>
                <option value="">-- Choisir une coopérative --</option>
                {cooperatives.map((c) => (
                  <option key={c.idCoop} value={c.idCoop}>{c.nomCoop}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn-primary"
                disabled={!choix}
                onClick={() => ouvrir(choix)}
              >
                Ouvrir
              </button>
            </section>

            <section className="card">
              {chargement && <p>Chargement...</p>}
              {!chargement && conversations.length === 0 && (
                <p>Aucune conversation. Choisissez une coopérative ci-dessus pour commencer.</p>
              )}

              {conversations.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Coopérative</th>
                      <th>Messages non lus</th>
                      <th>Dernier message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((c) => (
                      <tr key={c.idConversation}>
                        <td>{c.nomCoop}</td>
                        <td>
                          {c.nbNonLus > 0 ? (
                            <span className="badge attente">{c.nbNonLus}</span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>{c.dernierMessage ?? '—'}</td>
                        <td>
                          <button
                            type="button"
                            style={boutonLien}
                            onClick={() => navigate(`/messages/${c.idConversation}`)}
                          >
                            Ouvrir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}

        {estPresident && chargement && !erreur && (
          <section className="card"><p>Ouverture de la messagerie...</p></section>
        )}
      </main>
    </div>
  );
}