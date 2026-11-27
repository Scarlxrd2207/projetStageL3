import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Paperclip, Send, Check, CheckCheck, FileText, Download, MessageSquare } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import {
  getConversations,
  ouvrirConversation,
  getMessages,
  envoyerMessage,
  envoyerFichier,
  urlFichier,
  telechargerFichier,
} from '../../services/message.service';
import type {
  ConversationListe,
  DetailConversation,
  MessageAffiche,
} from '../../services/message.service';
import { getCooperativesFiltrees } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { lireSession } from '../../utils/session';
import { useMaj, usePresence } from '../../hooks/useTempsReel';
import type { Maj } from '../../services/socket';
import { contient } from '../../utils/filtres';
import '../../styles/dashboard.css';
import '../../styles/tiroir.css';

const RAFRAICHISSEMENT_MS = 30000;

function initiales(nom: string): string {
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((m) => m[0])
    .join('')
    .toUpperCase();
}

// dateEnvoi au format "DD/MM/YYYY HH:MM"
function jourDe(dateHeure: string): string {
  return dateHeure.split(' ')[0] ?? '';
}

function heureDe(dateHeure: string): string {
  return dateHeure.split(' ')[1] ?? '';
}

function estImage(nom: string): boolean {
  return /\.(png|jpe?g|gif)$/i.test(nom);
}

function BulleMessage({ m }: { m: MessageAffiche }) {
  const coche = m.estMoi
    ? m.luMessage === 'Oui'
      ? <CheckCheck size={14} />
      : <Check size={14} />
    : null;

  return (
    <div className={`msg-ligne ${m.estMoi ? 'moi' : ''}`}>
      <div className="msg-bulle">
        {m.fichier ? (
          estImage(m.fichier.nom) ? (
            <a href={urlFichier(m.fichier.url)} target="_blank" rel="noreferrer">
              <img className="msg-image" src={urlFichier(m.fichier.url)} alt={m.fichier.nom} />
            </a>
          ) : (
            <button
              type="button"
              className="msg-fichier"
              title="Télécharger"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'inherit',
                textAlign: 'left',
              }}
              onClick={() =>
                telechargerFichier(m.fichier!.url, m.fichier!.nom).catch(() =>
                  alert('Téléchargement impossible')
                )
              }
            >
              <FileText size={22} />
              <span>{m.fichier.nom}</span>
              <Download size={16} />
            </button>
          )
        ) : (
          <div className="msg-texte">{m.contenuMessage}</div>
        )}
        <div className="msg-pied">
          {!m.estMoi && <span>{m.expediteur} · </span>}
          <span>{heureDe(m.dateEnvoi)}</span>
          {coche}
        </div>
      </div>
    </div>
  );
}

export default function Messagerie() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = lireSession();
  const estResponsable = session?.role === 'RESPONSABLE';
  const enLigne = usePresence();

  const coopsEnLigne = useMemo(
    () => new Set(enLigne.map((p) => p.idCoop).filter((x): x is string => Boolean(x))),
    [enLigne]
  );

  const [conversations, setConversations] = useState<ConversationListe[]>([]);
  const [detail, setDetail] = useState<DetailConversation | null>(null);
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [choix, setChoix] = useState('');
  const [recherche, setRecherche] = useState('');
  const [texte, setTexte] = useState('');
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const fichierRef = useRef<HTMLInputElement>(null);
  const filRef = useRef<HTMLDivElement>(null);

  const chargerListe = useCallback(() => {
    getConversations().then(setConversations).catch(() => {});
  }, []);

  const chargerDetail = useCallback(() => {
    if (!id) return;
    getMessages(id)
      .then(setDetail)
      .catch(() => setErreur('Conversation introuvable'));
  }, [id]);

  // Premier chargement, et coopératives pour le responsable
  useEffect(() => {
    chargerListe();
    if (estResponsable) {
      getCooperativesFiltrees({})
        .then((liste) => setCooperatives(liste.filter((c) => c.inscrite === 'Oui')))
        .catch(() => {});
    }
  }, [chargerListe, estResponsable]);

  // Président sans conversation dans l'adresse : ouvrir directement la sienne
  useEffect(() => {
    if (!estResponsable && !id) {
      ouvrirConversation()
        .then((r) => navigate(`/messages/${r.idConversation}`, { replace: true }))
        .catch(() => setErreur('Messagerie indisponible'));
    }
  }, [estResponsable, id, navigate]);

  // Changement de discussion
  useEffect(() => {
    setDetail(null);
    setErreur('');
    chargerDetail();
  }, [chargerDetail]);

  // Filet de sécurité si le temps réel est coupé
  useEffect(() => {
    const minuterie = setInterval(() => {
      chargerListe();
      chargerDetail();
    }, RAFRAICHISSEMENT_MS);
    return () => clearInterval(minuterie);
  }, [chargerListe, chargerDetail]);

  // Temps réel : nouveau message dans la discussion ouverte
  const surMaj = useCallback(
    (m: Maj) => {
      chargerListe();
      if (m.type === 'message' && m.idConversation === id) chargerDetail();
    },
    [id, chargerListe, chargerDetail]
  );
  useMaj(surMaj);

  // Défilement vers le dernier message
  useEffect(() => {
    const fil = filRef.current;
    if (fil) fil.scrollTo({ top: fil.scrollHeight, behavior: 'smooth' });
  }, [detail?.messages.length]);

  const conversationActive = conversations.find((c) => c.idConversation === id);
  const enLigneActive = conversationActive ? coopsEnLigne.has(conversationActive.idCoop) : false;
  const listeFiltree = conversations.filter((c) => contient(recherche, [c.nomCoop]));

  async function envoyer() {
    const propre = texte.trim();
    if (!propre || !id || envoi) return;
    setEnvoi(true);
    setErreur('');
    try {
      await envoyerMessage(id, propre);
      setTexte('');
      chargerDetail();
      chargerListe();
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? "Envoi impossible : vérifiez que le serveur est lancé");
    } finally {
      setEnvoi(false);
    }
  }

  // Entrée envoie ; Maj + Entrée passe à la ligne
  function toucheSaisie(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  async function choisirFichier(e: ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = '';
    if (!fichier || !id) return;
    setEnvoi(true);
    setErreur('');
    try {
      await envoyerFichier(id, fichier);
      chargerDetail();
      chargerListe();
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Envoi du fichier impossible');
    } finally {
      setEnvoi(false);
    }
  }

  async function ouvrirAvec(idCoop: string) {
    setErreur('');
    try {
      const r = await ouvrirConversation(idCoop);
      setChoix('');
      chargerListe();
      navigate(`/messages/${r.idConversation}`);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Ouverture impossible');
    }
  }

  function rendreFil(messages: MessageAffiche[]): ReactElement[] {
    const elements: ReactElement[] = [];
    let jourCourant = '';
    for (const m of messages) {
      const jour = jourDe(m.dateEnvoi);
      if (jour !== jourCourant) {
        jourCourant = jour;
        elements.push(
          <div key={`sep-${m.idMessage}`} className="msg-sep">
            {jour}
          </div>
        );
      }
      elements.push(<BulleMessage key={m.idMessage} m={m} />);
    }
    return elements;
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main" style={{ paddingBottom: 0 }}>
        <div className="msg-app">
          <aside className="msg-gauche">
            <div className="msg-gauche-entete">
              <div className="msg-titre">Discussions</div>
              <div className="msg-recherche">
                <span className="loupe">
                  <Search size={16} />
                </span>
                <input
                  placeholder="Rechercher une coopérative"
                  value={recherche}
                  onChange={(e) => setRecherche(e.target.value)}
                />
              </div>

              {estResponsable && (
                <div className="msg-nouvelle">
                  <select value={choix} onChange={(e) => setChoix(e.target.value)}>
                    <option value="">Nouvelle discussion…</option>
                    {cooperatives.map((c) => (
                      <option key={c.idCoop} value={c.idCoop}>
                        {c.nomCoop}
                      </option>
                    ))}
                  </select>
                  <button type="button" className="btn-primary" disabled={!choix} onClick={() => ouvrirAvec(choix)}>
                    OK
                  </button>
                </div>
              )}
            </div>

            {estResponsable && enLigne.length > 0 && (
              <div className="presence">
                <div className="presence-titre">Présidents en ligne</div>
                <div className="presence-liste">
                  {enLigne.map((p) => (
                    <div
                      key={p.idUser}
                      className="presence-item"
                      title={`${p.nomCoop ?? ''} (${p.email})`}
                      onClick={() => p.idCoop && ouvrirAvec(p.idCoop)}
                    >
                      <div className="msg-avatar-wrap">
                        <span className="msg-avatar">{initiales(p.nomCoop ?? p.email)}</span>
                        <span className="point-vert-liste" />
                      </div>
                      <span className="nom">{p.nomCoop ?? p.email}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="msg-liste">
              {listeFiltree.map((c) => (
                <div
                  key={c.idConversation}
                  className={`msg-conv ${c.idConversation === id ? 'actif' : ''}`}
                  onClick={() => navigate(`/messages/${c.idConversation}`)}
                >
                  <div className="msg-avatar-wrap">
                    <span className="msg-avatar">{initiales(c.nomCoop)}</span>
                    {coopsEnLigne.has(c.idCoop) && <span className="point-vert-liste" />}
                  </div>
                  <div className="msg-conv-corps">
                    <div className="msg-conv-ligne">
                      <span>{c.nomCoop}</span>
                      {c.nbNonLus > 0 && <span className="msg-badge">{c.nbNonLus}</span>}
                    </div>
                    <div className="msg-conv-apercu">{c.dernierMessage ?? 'Aucun message'}</div>
                  </div>
                </div>
              ))}
              {listeFiltree.length === 0 && <p className="msg-vide">Aucune discussion</p>}
            </div>
          </aside>

          <section className="msg-droite">
            {!detail && (
              <div className="msg-vide">
                <MessageSquare size={40} />
                <p>{erreur || 'Sélectionnez une discussion pour commencer.'}</p>
              </div>
            )}

            {detail && (
              <>
                <div className="msg-droite-entete">
                  <div className="msg-avatar-wrap">
                    <span className="msg-avatar">{initiales(detail.nomCoop)}</span>
                    {estResponsable && enLigneActive && <span className="point-vert-liste" />}
                  </div>
                  <div>
                    <strong>{detail.nomCoop}</strong>
                    <div style={{ fontSize: 12, color: 'var(--texte-doux)' }}>
                      {estResponsable ? (enLigneActive ? 'En ligne' : 'Hors ligne') : 'Responsable SOAM'}
                    </div>
                  </div>
                </div>

                <div className="msg-fil" ref={filRef}>
                  {detail.messages.length === 0 ? (
                    <div className="msg-vide">Aucun message pour l'instant. Écrivez le premier !</div>
                  ) : (
                    rendreFil(detail.messages)
                  )}
                </div>

                <form
                  className="msg-saisie"
                  onSubmit={(e) => {
                    e.preventDefault();
                    envoyer();
                  }}
                >
                  <input
                    ref={fichierRef}
                    type="file"
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.docx,.xlsx,.txt"
                    onChange={choisirFichier}
                  />
                  <button
                    type="button"
                    className="msg-rond"
                    title="Joindre un fichier"
                    disabled={envoi}
                    onClick={() => fichierRef.current?.click()}
                  >
                    <Paperclip size={18} />
                  </button>
                  <textarea
                    rows={1}
                    value={texte}
                    onChange={(e) => setTexte(e.target.value)}
                    onKeyDown={toucheSaisie}
                    maxLength={500}
                    placeholder="Écrire un message…"
                  />
                  <button
                    type="submit"
                    className="msg-rond primaire"
                    title="Envoyer"
                    disabled={envoi || !texte.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>

                {erreur && <p style={{ color: '#ef4444', padding: '0 16px 10px', margin: 0 }}>{erreur}</p>}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}