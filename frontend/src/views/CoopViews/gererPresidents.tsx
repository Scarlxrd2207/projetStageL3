import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ShieldCheck, ShieldOff, Pencil, Save, X, Lock, User, Mail, Calendar, MapPin, KeyRound } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import ChampForm from '../../components/ChampForm';
import { getPresidents, modifierPresident, changerActifPresident } from '../../services/president.service';
import type { PresidentLigne } from '../../services/president.service';
import '../../styles/dashboard.css';

type Formulaire = {
  nom: string;
  prenom: string;
  dateNaissance: string;
  adresse: string;
  email: string;
  nouveauMotDePasse: string;
};

type Erreurs = Partial<Record<keyof Formulaire, string>>;

type Confirmation = { type: 'modif' } | { type: 'actif'; cible: PresidentLigne; actif: boolean };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function messageDe(err: unknown, defaut: string): string {
  const e = err as { response?: { data?: { message?: string } } };
  return e.response?.data?.message ?? defaut;
}

// "2026-11-18" devient "18/11/2026"
function dateFr(iso: string | null): string {
  if (!iso) return '—';
  const [annee, mois, jour] = iso.slice(0, 10).split('-');
  return `${jour}/${mois}/${annee}`;
}

export default function GererPresidents() {
  const [presidents, setPresidents] = useState<PresidentLigne[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');
  const [message, setMessage] = useState('');

  const [edition, setEdition] = useState<PresidentLigne | null>(null);
  const [form, setForm] = useState<Formulaire>({
    nom: '', prenom: '', dateNaissance: '', adresse: '', email: '', nouveauMotDePasse: '',
  });
  const [erreursForm, setErreursForm] = useState<Erreurs>({});

  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [motDePasseResp, setMotDePasseResp] = useState('');
  const [erreurModal, setErreurModal] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const aujourdhui = new Date().toISOString().slice(0, 10);

  const charger = useCallback(() => {
    getPresidents()
      .then((liste) => {
        setPresidents(liste);
        setErreur('');
      })
      .catch((err) => setErreur(messageDe(err, 'Impossible de charger les présidents')))
      .finally(() => setChargement(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(t);
  }, [message]);

  function ouvrirEdition(p: PresidentLigne) {
    setErreur('');
    setMessage('');
    setEdition(p);
    setForm({
      nom: p.nom ?? '',
      prenom: p.prenom ?? '',
      dateNaissance: p.dateNaissance ?? '',
      adresse: p.adresse ?? '',
      email: p.email,
      nouveauMotDePasse: '',
    });
    setErreursForm({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function fermerEdition() {
    setEdition(null);
    setErreursForm({});
  }

  function controler(): Erreurs {
    const e: Erreurs = {};
    if (form.nom.trim() === '') e.nom = 'Le nom est obligatoire';
    if (form.prenom.trim() === '') e.prenom = 'Le prénom est obligatoire';
    if (form.dateNaissance && form.dateNaissance > aujourdhui) e.dateNaissance = 'La date ne peut pas être dans le futur';
    if (form.email.trim() === '') e.email = "L'adresse e-mail est obligatoire";
    else if (!EMAIL_RE.test(form.email.trim())) e.email = 'Adresse e-mail invalide';
    if (form.nouveauMotDePasse !== '' && form.nouveauMotDePasse.length < 6) {
      e.nouveauMotDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    return e;
  }

  function soumettre(ev: FormEvent) {
    ev.preventDefault();
    const e = controler();
    setErreursForm(e);
    if (Object.keys(e).length > 0) return;
    setMotDePasseResp('');
    setErreurModal('');
    setConfirmation({ type: 'modif' });
  }

  function demanderActivation(p: PresidentLigne) {
    setErreur('');
    setMessage('');
    setMotDePasseResp('');
    setErreurModal('');
    setConfirmation({ type: 'actif', cible: p, actif: p.actifUtilisateur !== 'Oui' });
  }

  async function confirmer(ev: FormEvent) {
    ev.preventDefault();
    if (!confirmation) return;
    if (motDePasseResp === '') {
      setErreurModal('Saisissez votre mot de passe pour confirmer');
      return;
    }

    setEnvoi(true);
    setErreurModal('');
    try {
      if (confirmation.type === 'modif' && edition) {
        await modifierPresident(edition.idUser, {
          nom: form.nom.trim(),
          prenom: form.prenom.trim(),
          dateNaissance: form.dateNaissance,
          adresse: form.adresse.trim(),
          email: form.email.trim(),
          nouveauMotDePasse: form.nouveauMotDePasse || undefined,
          motDePasseResponsable: motDePasseResp,
        });
        setMessage('Informations du président modifiées');
        fermerEdition();
      } else if (confirmation.type === 'actif') {
        await changerActifPresident(confirmation.cible.idUser, confirmation.actif, motDePasseResp);
        setMessage(confirmation.actif ? 'Compte du président réactivé' : 'Compte du président désactivé');
      }
      setConfirmation(null);
      setMotDePasseResp('');
      charger();
    } catch (err) {
      setErreurModal(messageDe(err, 'Confirmation impossible'));
    } finally {
      setEnvoi(false);
    }
  }

  function annulerConfirmation() {
    setConfirmation(null);
    setMotDePasseResp('');
    setErreurModal('');
  }

  const libelleModal =
    confirmation?.type === 'modif'
      ? 'Confirmer la modification des informations du président ?'
      : confirmation?.type === 'actif'
        ? confirmation.actif
          ? `Réactiver le compte de ${confirmation.cible.prenom ?? ''} ${confirmation.cible.nom ?? ''} ?`
          : `Désactiver le compte de ${confirmation.cible.prenom ?? ''} ${confirmation.cible.nom ?? ''} ? Il ne pourra plus se connecter.`
        : '';

  const boutonLien = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--bordure)',
    background: 'none',
    color: 'var(--texte)',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
          <div>
            <h1 style={{ margin: 0 }}>Présidents de coopérative</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)', fontSize: 13 }}>
              Toute modification ou désactivation demande votre mot de passe pour confirmation.
            </p>
          </div>
        </header>

        {message && (
          <section className="card">
            <p style={{ color: 'var(--accent)' }}>{message}</p>
          </section>
        )}
        {erreur && (
          <section className="card">
            <p style={{ color: '#ef4444' }}>{erreur}</p>
          </section>
        )}

        {edition && (
          <form className="form-carte" onSubmit={soumettre} noValidate style={{ marginBottom: 24 }}>
            <h2 className="form-titre">Modifier le président</h2>
            <p className="form-sous-titre">
              {edition.nomCoop ?? 'Coopérative'} · identifiant {edition.idUser}
            </p>

            <div className="form-grille">
              <ChampForm id="gp-nom" label="Nom" icone={User} obligatoire erreur={erreursForm.nom}>
                <input
                  id="gp-nom"
                  className={`form-input${erreursForm.nom ? ' invalide' : ''}`}
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  maxLength={100}
                />
              </ChampForm>

              <ChampForm id="gp-prenom" label="Prénom" icone={User} obligatoire erreur={erreursForm.prenom}>
                <input
                  id="gp-prenom"
                  className={`form-input${erreursForm.prenom ? ' invalide' : ''}`}
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  maxLength={100}
                />
              </ChampForm>

              <ChampForm id="gp-naissance" label="Date de naissance" icone={Calendar} erreur={erreursForm.dateNaissance}>
                <input
                  id="gp-naissance"
                  type="date"
                  className={`form-input${erreursForm.dateNaissance ? ' invalide' : ''}`}
                  value={form.dateNaissance}
                  max={aujourdhui}
                  onChange={(e) => setForm({ ...form, dateNaissance: e.target.value })}
                />
              </ChampForm>

              <ChampForm id="gp-adresse" label="Adresse" icone={MapPin}>
                <input
                  id="gp-adresse"
                  className="form-input"
                  value={form.adresse}
                  onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                  maxLength={200}
                />
              </ChampForm>

              <ChampForm id="gp-email" label="Adresse e-mail" icone={Mail} obligatoire pleine erreur={erreursForm.email}>
                <input
                  id="gp-email"
                  type="email"
                  className={`form-input${erreursForm.email ? ' invalide' : ''}`}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="off"
                />
              </ChampForm>

              <ChampForm
                id="gp-mdp"
                label="Nouveau mot de passe"
                icone={KeyRound}
                pleine
                erreur={erreursForm.nouveauMotDePasse}
                aide="Laissez vide pour conserver le mot de passe actuel. 6 caractères minimum."
              >
                <input
                  id="gp-mdp"
                  type="password"
                  className={`form-input${erreursForm.nouveauMotDePasse ? ' invalide' : ''}`}
                  value={form.nouveauMotDePasse}
                  onChange={(e) => setForm({ ...form, nouveauMotDePasse: e.target.value })}
                  autoComplete="new-password"
                />
              </ChampForm>
            </div>

            <div className="form-actions">
              <button type="button" className="form-btn-secondaire" onClick={fermerEdition}>
                <X size={16} /> Annuler
              </button>
              <button type="submit" className="form-btn-principal">
                <Save size={16} /> Enregistrer les modifications
              </button>
            </div>
          </form>
        )}

        <section className="card">
          {chargement && <p>Chargement…</p>}
          {!chargement && presidents.length === 0 && <p>Aucun président enregistré.</p>}

          {presidents.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Coopérative</th>
                  <th>Président</th>
                  <th>Adresse e-mail</th>
                  <th>Naissance</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {presidents.map((p) => {
                  const actif = p.actifUtilisateur === 'Oui';
                  return (
                    <tr key={p.idUser}>
                      <td><strong>{p.nomCoop ?? p.idCoop ?? '—'}</strong></td>
                      <td>{p.prenom ?? ''} {p.nom ?? ''}</td>
                      <td>{p.email}</td>
                      <td>{dateFr(p.dateNaissance)}</td>
                      <td>
                        <span className={`badge ${actif ? 'livree' : 'refusee'}`}>
                          {actif ? 'Actif' : 'Désactivé'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <button type="button" style={boutonLien} onClick={() => ouvrirEdition(p)}>
                            <Pencil size={14} /> Modifier
                          </button>
                          <button
                            type="button"
                            style={{ ...boutonLien, color: actif ? '#ef4444' : 'var(--accent)' }}
                            onClick={() => demanderActivation(p)}
                          >
                            {actif ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                            {actif ? 'Désactiver' : 'Réactiver'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {confirmation && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
        >
          <form onSubmit={confirmer} noValidate className="form-carte" style={{ maxWidth: 460, width: '100%' }}>
            <h2 className="form-titre" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={18} /> Confirmation
            </h2>
            <p className="form-sous-titre">{libelleModal}</p>

            <div className="form-champ pleine">
              <label className="form-label" htmlFor="gp-mdp-resp">
                Votre mot de passe (responsable)<span className="obligatoire">*</span>
              </label>
              <div className="form-entree avec-icone">
                <Lock size={16} />
                <input
                  id="gp-mdp-resp"
                  type="password"
                  className={`form-input${erreurModal ? ' invalide' : ''}`}
                  value={motDePasseResp}
                  onChange={(e) => setMotDePasseResp(e.target.value)}
                  autoFocus
                  autoComplete="current-password"
                />
              </div>
              {erreurModal && <span className="form-erreur-champ">{erreurModal}</span>}
            </div>

            <div className="form-actions">
              <button type="button" className="form-btn-secondaire" onClick={annulerConfirmation}>
                <X size={16} /> Annuler
              </button>
              <button type="submit" className="form-btn-principal" disabled={envoi}>
                {envoi ? 'Confirmation…' : 'Confirmer'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}