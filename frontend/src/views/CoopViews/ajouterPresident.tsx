import { useEffect, useState } from 'react';
<<<<<<< HEAD
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { User, Calendar, MapPin, Mail, Lock, Eye, EyeOff, UserPlus, X } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import ChampForm from '../../components/ChampForm';
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { creerPresident } from '../../services/profil.service';
import '../../styles/dashboard.css';

type Cle = 'nom' | 'prenom' | 'dateNaissance' | 'email' | 'motDePasse' | 'confirmation';
type Erreurs = Partial<Record<Cle, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AjouterPresident() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');
  const [adresse, setAdresse] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [voirMotDePasse, setVoirMotDePasse] = useState(false);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [bandeau, setBandeau] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const aujourdhui = new Date().toISOString().slice(0, 10);
=======
import { useNavigate, useParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import FormulairePresident from '../../components/FormulairePresident';
import { getCooperative } from '../../services/cooperative.service';
import type { Cooperative } from '../../services/cooperative.service';
import { creerPresident } from '../../services/utilisateur.service';
import { lireSession } from '../../utils/session';
import '../../styles/dashboard.css';

export default function AjouterPresident() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const session = lireSession();

  const [coop, setCoop] = useState<Cooperative | null>(null);
  const [erreurChargement, setErreurChargement] = useState('');
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

  useEffect(() => {
    if (!id) return;
    getCooperative(id)
      .then(setCoop)
<<<<<<< HEAD
      .catch(() => setBandeau('Coopérative introuvable'));
  }, [id]);

  function controler(): boolean {
    const e: Erreurs = {};
    if (nom.trim() === '') e.nom = 'Le nom est obligatoire';
    if (prenom.trim() === '') e.prenom = 'Le prénom est obligatoire';
    if (dateNaissance && dateNaissance > aujourdhui) e.dateNaissance = 'La date ne peut pas être dans le futur';
    if (email.trim() === '') e.email = "L'adresse e-mail est obligatoire";
    else if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide';
    if (motDePasse.length < 6) e.motDePasse = 'Le mot de passe doit contenir au moins 6 caractères';
    if (confirmation !== motDePasse) e.confirmation = 'Les deux mots de passe ne sont pas identiques';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBandeau('');
    if (!id || !controler()) return;
    setEnvoi(true);
    try {
      await creerPresident({
        idCoop: id,
        nom: nom.trim(),
        prenom: prenom.trim(),
        dateNaissance,
        adresse: adresse.trim(),
        email: email.trim(),
        motDePasse,
      });
      navigate('/cooperatives');
    } catch (err: any) {
      setBandeau(err?.response?.data?.message ?? 'Création impossible');
    } finally {
      setEnvoi(false);
=======
      .catch(() => setErreurChargement('Coopérative introuvable'));
  }, [id]);

  async function enregistrer(d: { email: string; motDePasse: string }): Promise<string | null> {
    if (!session || !id) return 'Session incomplète, reconnectez-vous';
    try {
      await creerPresident(session.idUser, { ...d, idCoop: id });
      navigate('/cooperatives');
      return null;
    } catch (err: any) {
      return err?.response?.data?.message ?? 'Création impossible';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
    }
  }

  return (
    <div className="dash">
      <Sidebar />
      <main className="dash-main">
        <header className="dash-header">
<<<<<<< HEAD
          <div>
            <h1 style={{ margin: 0 }}>Créer le compte du président</h1>
            {coop && (
              <p style={{ margin: '4px 0 0', color: 'var(--texte-doux)' }}>
                Coopérative : {coop.nomCoop} ({coop.idCoop})
              </p>
            )}
          </div>
        </header>

        <form className="form-carte" onSubmit={handleSubmit} noValidate>
          <h2 className="form-titre">Identité</h2>
          <p className="form-sous-titre">Ces informations identifient le président de la coopérative.</p>

          <div className="form-grille">
            <ChampForm id="pres-nom" label="Nom" icone={User} obligatoire erreur={erreurs.nom}>
              <input
                id="pres-nom"
                className={`form-input${erreurs.nom ? ' invalide' : ''}`}
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                maxLength={100}
              />
            </ChampForm>

            <ChampForm id="pres-prenom" label="Prénom" icone={User} obligatoire erreur={erreurs.prenom}>
              <input
                id="pres-prenom"
                className={`form-input${erreurs.prenom ? ' invalide' : ''}`}
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                maxLength={100}
              />
            </ChampForm>

            <ChampForm
              id="pres-naissance"
              label="Date de naissance"
              icone={Calendar}
              erreur={erreurs.dateNaissance}
              aide="Facultative"
            >
              <input
                id="pres-naissance"
                type="date"
                className={`form-input${erreurs.dateNaissance ? ' invalide' : ''}`}
                value={dateNaissance}
                max={aujourdhui}
                onChange={(e) => setDateNaissance(e.target.value)}
              />
            </ChampForm>

            <ChampForm id="pres-adresse" label="Adresse" icone={MapPin} pleine aide="Facultative">
              <input
                id="pres-adresse"
                className="form-input"
                value={adresse}
                onChange={(e) => setAdresse(e.target.value)}
                maxLength={200}
                placeholder="Ex. Ankofafa Ambony, Fianarantsoa"
              />
            </ChampForm>
          </div>

          <h2 className="form-titre" style={{ marginTop: 30 }}>Accès</h2>
          <p className="form-sous-titre">Le président se connecte avec cette adresse e-mail et ce mot de passe.</p>

          <div className="form-grille">
            <ChampForm id="pres-email" label="Adresse e-mail" icone={Mail} obligatoire pleine erreur={erreurs.email}>
              <input
                id="pres-email"
                type="email"
                className={`form-input${erreurs.email ? ' invalide' : ''}`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </ChampForm>

            <ChampForm
              id="pres-mdp"
              label="Mot de passe"
              icone={Lock}
              obligatoire
              erreur={erreurs.motDePasse}
              aide="6 caractères minimum"
            >
              <input
                id="pres-mdp"
                type={voirMotDePasse ? 'text' : 'password'}
                className={`form-input avec-oeil${erreurs.motDePasse ? ' invalide' : ''}`}
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="form-oeil"
                style={{ right: 12 }}
                aria-label="Afficher ou masquer le mot de passe"
                onClick={() => setVoirMotDePasse((v) => !v)}
              >
                {voirMotDePasse ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </ChampForm>

            <ChampForm
              id="pres-confirmation"
              label="Confirmer le mot de passe"
              icone={Lock}
              obligatoire
              erreur={erreurs.confirmation}
            >
              <input
                id="pres-confirmation"
                type={voirMotDePasse ? 'text' : 'password'}
                className={`form-input${erreurs.confirmation ? ' invalide' : ''}`}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                autoComplete="new-password"
              />
            </ChampForm>
          </div>

          {bandeau && <div className="form-bandeau-erreur">{bandeau}</div>}

          <div className="form-actions">
            <button type="button" className="form-btn-secondaire" onClick={() => navigate('/cooperatives')}>
              <X size={16} /> Annuler
            </button>
            <button type="submit" className="form-btn-principal" disabled={envoi || !coop}>
              <UserPlus size={16} /> {envoi ? 'Création…' : 'Créer le compte'}
            </button>
          </div>
        </form>
=======
          <h1>Compte du président</h1>
        </header>
        <section className="card">
          {erreurChargement && <p style={{ color: '#ef4444' }}>{erreurChargement}</p>}
          {!erreurChargement && !coop && <p>Chargement...</p>}
          {coop && (
            <FormulairePresident
              nomCoop={`${coop.nomCoop} (${coop.idCoop})`}
              onSubmit={enregistrer}
              onAnnuler={() => navigate('/cooperatives')}
            />
          )}
        </section>
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
      </main>
    </div>
  );
}