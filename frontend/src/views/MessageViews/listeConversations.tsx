import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { getConversations, ouvrirConversation } from '../../services/message.service';
import type { ConversationListe } from '../../services/message.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';
<<<<<<< HEAD
import '../../styles/tiroir.css';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export default function ListeConversations() {
  const navigate = useNavigate();
  const session = lireSession();
<<<<<<< HEAD
  const estResponsable = session?.role === 'RESPONSABLE';
=======
  const estPresident = session?.role === 'PRESIDENT';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  const [conversations, setConversations] = useState<ConversationListe[]>([]);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [choix, setChoix] = useState('');
  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(true);

<<<<<<< HEAD
  // Le président n'a qu'une conversation : on l'ouvre directement
  useEffect(() => {
    if (!session) return;

    if (!estResponsable) {
      ouvrirConversation()
        .then((r) => navigate(`/messages/${r.idConversation}`, { replace: true }))
        .catch((err: any) => {
          setErreur(err?.response?.data?.message ?? "Impossible d'ouvrir la messagerie");
=======
  useEffect(() => {
    if (!session) return;

    if (estPresident) {
      // le président va directement à la conversation de sa coopérative
      ouvrirConversation(session.idUser)
        .then((r) => navigate(`/messages/${r.idConversation}`, { replace: true }))
        .catch((err) => {
          setErreur(err?.response?.data?.message ?? 'Impossible d\'ouvrir la messagerie');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
          setChargement(false);
        });
      return;
    }

<<<<<<< HEAD
    getConversations()
=======
    getConversations(session.idUser)
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      .then(setConversations)
      .catch(() => setErreur('Impossible de charger les conversations'))
      .finally(() => setChargement(false));

    getCooperativesFiltrees({})
      .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
      .catch(() => {});
<<<<<<< HEAD
  }, [estResponsable, navigate]);

  async function ouvrir(idCoop: string) {
    setErreur('');
    try {
      const r = await ouvrirConversation(idCoop);
=======
  }, []);

  async function ouvrir(idCoop: string) {
    if (!session) return;
    setErreur('');
    try {
      const r = await ouvrirConversation(session.idUser, idCoop);
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      navigate(`/messages/${r.idConversation}`);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Ouverture impossible');
    }
  }

<<<<<<< HEAD
=======
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

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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

<<<<<<< HEAD
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
=======
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
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                Ouvrir
              </button>
            </section>

            <section className="card">
              {chargement && <p>Chargement...</p>}
              {!chargement && conversations.length === 0 && (
<<<<<<< HEAD
                <p>Aucune discussion. Choisissez une coopérative ci-dessus pour commencer.</p>
=======
                <p>Aucune conversation. Choisissez une coopérative ci-dessus pour commencer.</p>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
              )}

              {conversations.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Coopérative</th>
<<<<<<< HEAD
                      <th>Non lus</th>
=======
                      <th>Messages non lus</th>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                      <th>Dernier message</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conversations.map((c) => (
                      <tr key={c.idConversation}>
                        <td>{c.nomCoop}</td>
<<<<<<< HEAD
                        <td>{c.nbNonLus > 0 ? c.nbNonLus : '—'}</td>
=======
                        <td>
                          {c.nbNonLus > 0 ? (
                            <span className="badge attente">{c.nbNonLus}</span>
                          ) : (
                            '—'
                          )}
                        </td>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
                        <td>{c.dernierMessage ?? '—'}</td>
                        <td>
                          <button
                            type="button"
<<<<<<< HEAD
                            onClick={() => navigate(`/messages/${c.idConversation}`)}
                            style={{
                              background: 'none',
                              border: '1px solid var(--bordure)',
                              color: 'var(--texte-doux)',
                              padding: '6px 10px',
                              borderRadius: 8,
                              cursor: 'pointer',
                            }}
=======
                            style={boutonLien}
                            onClick={() => navigate(`/messages/${c.idConversation}`)}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
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
<<<<<<< HEAD
=======

        {estPresident && chargement && !erreur && (
          <section className="card"><p>Ouverture de la messagerie...</p></section>
        )}
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      </main>
    </div>
  );
}