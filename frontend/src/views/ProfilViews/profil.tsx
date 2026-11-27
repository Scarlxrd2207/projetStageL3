import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, ShieldCheck, Settings, LogOut, Sun, Moon, Check, Languages, Pencil, Save } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { getProfil, modifierProfil, changerMotDePasse } from '../../services/profil.service';
import type { Profil, DonneesIdentite } from '../../services/profil.service';
import { useTheme } from '../../context/ThemeContext';
import { useLangue } from '../../context/LangueContext';
import { LANGUES } from '../../i18n/traductions';
import { effacerSession } from '../../utils/session';
import { deconnecterTempsReel } from '../../services/socket';
import '../../styles/dashboard.css';
import '../../styles/tiroir.css';

type Onglet = 'compte' | 'securite' | 'parametres';

// "1985-04-12" devient "12/04/1985"
function formaterDate(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

export default function ProfilPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { langue, setLangue, t } = useLangue();

  const [onglet, setOnglet] = useState<Onglet>('compte');
  const [profil, setProfil] = useState<Profil | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');

  // Modification du compte
  const [edition, setEdition] = useState(false);
  const [formulaire, setFormulaire] = useState<DonneesIdentite>({
    email: '', nom: '', prenom: '', adresse: '', dateNaissance: '',
  });
  const [erreurCompte, setErreurCompte] = useState('');
  const [messageCompte, setMessageCompte] = useState('');

  // Mot de passe
  const [ancien, setAncien] = useState('');
  const [nouveau, setNouveau] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function remplirFormulaire(p: Profil) {
    setFormulaire({
      email: p.email,
      nom: p.nom ?? '',
      prenom: p.prenom ?? '',
      adresse: p.adresse ?? '',
      dateNaissance: p.dateNaissance ?? '',
    });
  }

  useEffect(() => {
    getProfil()
      .then((p) => {
        setProfil(p);
        remplirFormulaire(p);
      })
      .catch((err: any) => setErreurChargement(err?.response?.data?.message ?? 'Profil introuvable'));
  }, []);

  async function enregistrerCompte(e: FormEvent) {
    e.preventDefault();
    setErreurCompte('');
    setMessageCompte('');
    setEnvoi(true);
    try {
      const p = await modifierProfil(formulaire);
      setProfil(p);
      remplirFormulaire(p);
      setEdition(false);
      setMessageCompte('Informations enregistrées');
    } catch (err: any) {
      setErreurCompte(err?.response?.data?.message ?? 'Enregistrement impossible');
    } finally {
      setEnvoi(false);
    }
  }

  async function changer(e: FormEvent) {
    e.preventDefault();
    setErreur('');
    setMessage('');

    if (nouveau.length < 6) {
      setErreur('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (nouveau !== confirmation) {
      setErreur('Les deux mots de passe ne sont pas identiques');
      return;
    }

    setEnvoi(true);
    try {
      await changerMotDePasse(ancien, nouveau);
      setMessage(t('securite.ok'));
      setAncien('');
      setNouveau('');
      setConfirmation('');
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Modification impossible');
    } finally {
      setEnvoi(false);
    }
  }

  function deconnexion() {
    if (!window.confirm(t('profil.confirmerDeconnexion'))) return;
    deconnecterTempsReel();
    effacerSession();
    navigate('/login');
  }

  const libelleRole = profil?.role === 'PRESIDENT' ? t('role.president') : t('role.responsable');
  const nomComplet = profil?.nom || profil?.prenom ? `${profil?.prenom ?? ''} ${profil?.nom ?? ''}`.trim() : profil?.email ?? '';
  const initiale = (profil?.prenom || profil?.email || '?').charAt(0).toUpperCase();

  const champ = { width: '100%', padding: 10, marginBottom: 14, borderRadius: 10, boxSizing: 'border-box' as const };
  const label = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <h1>{t('profil.titre')}</h1>
        </header>

        {erreurChargement && (
          <section className="card"><p style={{ color: '#ef4444' }}>{erreurChargement}</p></section>
        )}

        {profil && (
          <div className="profil-page">
            <aside className="card">
              <div className="entete-profil" style={{ marginBottom: 18 }}>
                <span className="avatar-grand">{initiale}</span>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{nomComplet}</strong>
                  <span className="texte-doux petit">{libelleRole}</span>
                </div>
              </div>

              <nav className="profil-menu">
                <button type="button" className={onglet === 'compte' ? 'actif' : ''} onClick={() => setOnglet('compte')}>
                  <UserCircle size={18} /> {t('profil.compte')}
                </button>
                <button type="button" className={onglet === 'securite' ? 'actif' : ''} onClick={() => setOnglet('securite')}>
                  <ShieldCheck size={18} /> {t('profil.securite')}
                </button>
                <button type="button" className={onglet === 'parametres' ? 'actif' : ''} onClick={() => setOnglet('parametres')}>
                  <Settings size={18} /> {t('profil.parametres')}
                </button>
                <button type="button" className="danger" onClick={deconnexion}>
                  <LogOut size={18} /> {t('profil.deconnexion')}
                </button>
              </nav>
            </aside>

            <section>
              {onglet === 'compte' && (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <h3 style={{ margin: 0 }}>{t('profil.infos')}</h3>
                    {!edition && (
                      <button type="button" className="btn-primary" onClick={() => setEdition(true)}
                        style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <Pencil size={16} /> Modifier
                      </button>
                    )}
                  </div>

                  {!edition && (
                    <>
                      <div className="ligne-info"><span className="texte-doux">{t('profil.identifiant')}</span><strong>{profil.idUser}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">Nom</span><strong>{profil.nom ?? '—'}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">Prénom</span><strong>{profil.prenom ?? '—'}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">Date de naissance</span><strong>{formaterDate(profil.dateNaissance)}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">Adresse</span><strong>{profil.adresse ?? '—'}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">{t('profil.email')}</span><strong>{profil.email}</strong></div>
                      <div className="ligne-info"><span className="texte-doux">{t('profil.role')}</span><strong>{libelleRole}</strong></div>
                      {profil.role === 'PRESIDENT' && (
                        <div className="ligne-info"><span className="texte-doux">{t('profil.cooperative')}</span><strong>{profil.nomCoop ?? profil.idCoop}</strong></div>
                      )}
                      {messageCompte && <p style={{ color: 'var(--accent)', marginTop: 12 }}>{messageCompte}</p>}
                    </>
                  )}

                  {edition && (
                    <form onSubmit={enregistrerCompte} noValidate>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <label style={label}>Nom</label>
                          <input style={champ} value={formulaire.nom} onChange={(e) => setFormulaire({ ...formulaire, nom: e.target.value })} />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <label style={label}>Prénom</label>
                          <input style={champ} value={formulaire.prenom} onChange={(e) => setFormulaire({ ...formulaire, prenom: e.target.value })} />
                        </div>
                      </div>

                      <label style={label}>Date de naissance</label>
                      <input style={champ} type="date" max={new Date().toISOString().slice(0, 10)}
                        value={formulaire.dateNaissance} onChange={(e) => setFormulaire({ ...formulaire, dateNaissance: e.target.value })} />

                      <label style={label}>Adresse</label>
                      <input style={champ} value={formulaire.adresse} onChange={(e) => setFormulaire({ ...formulaire, adresse: e.target.value })} />

                      <label style={label}>{t('profil.email')}</label>
                      <input style={champ} type="email" value={formulaire.email} onChange={(e) => setFormulaire({ ...formulaire, email: e.target.value })} />

                      {erreurCompte && <p style={{ color: '#ef4444' }}>{erreurCompte}</p>}

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" className="btn-primary" disabled={envoi} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <Save size={16} /> {envoi ? t('commun.chargement') : t('commun.enregistrer')}
                        </button>
                        <button type="button" onClick={() => { setEdition(false); remplirFormulaire(profil); setErreurCompte(''); }}
                          style={{ background: 'none', border: '1px solid var(--bordure)', color: 'var(--texte-doux)', padding: '10px 16px', borderRadius: 10, cursor: 'pointer' }}>
                          {t('commun.annuler')}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {onglet === 'securite' && (
                <div className="card" style={{ maxWidth: 560 }}>
                  <h3>{t('securite.titre')}</h3>
                  <form onSubmit={changer} noValidate>
                    <label style={label}>{t('securite.actuel')}</label>
                    <input style={champ} type="password" value={ancien} onChange={(e) => setAncien(e.target.value)} />
                    <label style={label}>{t('securite.nouveau')}</label>
                    <input style={champ} type="password" value={nouveau} onChange={(e) => setNouveau(e.target.value)} />
                    <label style={label}>{t('securite.confirmer')}</label>
                    <input style={champ} type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
                    {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}
                    {message && <p style={{ color: 'var(--accent)' }}>{message}</p>}
                    <button type="submit" className="btn-primary" disabled={envoi}>
                      {envoi ? t('commun.chargement') : t('securite.bouton')}
                    </button>
                  </form>
                </div>
              )}

              {onglet === 'parametres' && (
                <>
                  <div className="card" style={{ marginBottom: 18 }}>
                    <h3>{t('param.apparence')}</h3>
                    <p className="texte-doux">{t('param.apparenceDesc')}</p>
                    <div className="theme-cartes" style={{ marginTop: 16 }}>
                      <button type="button" className={`theme-carte ${theme === 'clair' ? 'actif' : ''}`} onClick={() => setTheme('clair')}>
                        <div className="apercu clair" />
                        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Sun size={18} /> {t('param.clair')}
                          {theme === 'clair' && <Check size={16} style={{ color: 'var(--accent)' }} />}
                        </span>
                      </button>
                      <button type="button" className={`theme-carte ${theme === 'sombre' ? 'actif' : ''}`} onClick={() => setTheme('sombre')}>
                        <div className="apercu sombre" />
                        <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Moon size={18} /> {t('param.sombre')}
                          {theme === 'sombre' && <Check size={16} style={{ color: 'var(--accent)' }} />}
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="card">
                    <h3>{t('param.langue')}</h3>
                    <p className="texte-doux">{t('param.langueDesc')}</p>
                    <div className="theme-cartes" style={{ marginTop: 16 }}>
                      {LANGUES.map((l) => {
                        const actif = langue === l.code;
                        return (
                          <button key={l.code} type="button" className={`theme-carte ${actif ? 'actif' : ''}`} onClick={() => setLangue(l.code)}>
                            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <Languages size={18} /> {l.libelle}
                              {actif && <Check size={16} style={{ color: 'var(--accent)' }} />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}