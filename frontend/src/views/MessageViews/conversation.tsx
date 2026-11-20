import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulaireMessage from '../../components/FormulaireMessage';
import { getMessages, envoyerMessage } from '../../services/message.service';
import type { DetailConversation } from '../../services/message.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

const RAFRAICHISSEMENT_MS = 15000;

export default function Conversation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = lireSession();
  const estResponsable = session?.role === 'RESPONSABLE';

  const [detail, setDetail] = useState<DetailConversation | null>(null);
  const [erreur, setErreur] = useState('');
  const basRef = useRef<HTMLDivElement>(null);

  const charger = useCallback(() => {
    if (!id || !session) return;
    getMessages(id, session.idUser)
      .then((d) => {
        setDetail(d);
        setErreur('');
      })
      .catch(() => setErreur('Conversation introuvable'));
  }, [id]);

  useEffect(() => {
    charger();
    const minuterie = setInterval(charger, RAFRAICHISSEMENT_MS);
    return () => clearInterval(minuterie);
  }, [charger]);

  // Défile vers le dernier message à chaque nouvel affichage
  useEffect(() => {
    basRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [detail?.messages.length]);

  async function envoyer(contenu: string): Promise<string | null> {
    if (!id || !session) return 'Session incomplète, reconnectez-vous';
    try {
      await envoyerMessage(id, session.idUser, contenu);
      charger();
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Envoi impossible';
    }
  }

  const boutonLien = {
    background: 'none',
    border: '1px solid var(--bordure)',
    color: 'var(--texte-doux)',
    padding: '8px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>{detail ? `Messagerie : ${detail.nomCoop}` : 'Messagerie'}</h1>
          {estResponsable && (
            <button type="button" style={boutonLien} onClick={() => navigate('/messages')}>
              Retour
            </button>
          )}
        </header>

        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {detail && (
          <>
            <section className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '60vh', overflowY: 'auto' }}>
              {detail.messages.length === 0 && (
                <p style={{ color: 'var(--texte-doux)' }}>Aucun message pour l'instant.</p>
              )}

              {detail.messages.map((m) => (
                <div
                  key={m.idMessage}
                  style={{ display: 'flex', justifyContent: m.estMoi ? 'flex-end' : 'flex-start' }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      background: m.estMoi ? 'var(--accent)' : 'var(--fond-side)',
                      color: m.estMoi ? 'var(--accent-texte)' : 'var(--texte)',
                      border: m.estMoi ? 'none' : '1px solid var(--bordure)',
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                      {m.expediteur} · {m.dateEnvoi}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{m.contenuMessage}</div>
                  </div>
                </div>
              ))}
              <div ref={basRef} />
            </section>

            <section className="card">
              <FormulaireMessage onEnvoyer={envoyer} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}