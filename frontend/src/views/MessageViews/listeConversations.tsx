import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getConversations, ouvrirConversation } from '../../services/message.service';
import type { ConversationListe } from '../../services/message.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';
import '../../styles/tiroir.css';

export default function ListeConversations() {
  const navigate = useNavigate();
  const session = lireSession();
  const estResponsable = session?.role === 'RESPONSABLE';

  const [conversations, setConversations] = useState<ConversationListe[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [choix, setChoix] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

  // Le président n'a qu'une conversation : on l'ouvre directement
  useEffect(() => {
    if (!session) return;

    if (!estResponsable) {
      ouvrirConversation()
        .then((r) => navigate(`/messages/${r.idConversation}`, { replace: true }))
        .catch((err: any) => {
          setErreur(err?.response?.data?.message ?? "Impossible d'ouvrir la messagerie");
          setChargement(false);
        });
      return;
    }

    getConversations()
      .then(setConversations)
      .catch(() => setErreur('Impossible de charger les conversations'))
      .finally(() => setChargement(false));

    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => {});
  }, [estResponsable, navigate]);

  async function ouvrir(idCoop: string) {
    setErreur('');
    try {
      const r = await ouvrirConversation(idCoop);
      navigate(`/messages/${r.idConversation}`);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Ouverture impossible');
    }
  }

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

        {estResponsable && (
          <>
            <section className="card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <select
                value={choix}
                onChange={(e) => setChoix(e.target.value)}
                style={{ flex: 1, padding: 10, borderRadius: 10 }}
              >
                <option value="">-- Nouvelle discussion avec une coopérative --</option>
                {cooperatives.map((c) => (
                  <option key={c.idCoop} value={c.idCoop}>
                    {c.nomCoop}
                  </option>
                ))}
              </select>
              <button type="button" className="btn-primary" disabled={!choix} onClick={() => ouvrir(choix)}>
                Ouvrir
              </button>
            </section>

            <section className="card">
              {chargement && <p>Chargement...</p>}
              {!chargement && conversations.length === 0 && (
                <p>Aucune discussion. Choisissez une coopérative ci-dessus pour commencer.</p>
              )}

              {conversations.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Coopérative</th>
                      <th>Non lus</th>
                      <th>Dernier message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((c) => (
                      <tr key={c.idConversation}>
                        <td>{c.nomCoop}</td>
                        <td>{c.nbNonLus > 0 ? c.nbNonLus : '—'}</td>
                        <td>{c.dernierMessage ?? '—'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => navigate(`/messages/${c.idConversation}`)}
                            style={{
                              background: 'none',
                              border: '1px solid var(--bordure)',
                              color: 'var(--texte-doux)',
                              padding: '6px 10px',
                              borderRadius: 8,
                              cursor: 'pointer',
                            }}
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
      </main>
    </div>
  );
}