import { useState } from 'react';
<<<<<<< HEAD
import type { FormEvent } from 'react';
import { User, Phone, MapPin, Building2, Save, X } from 'lucide-react';
import ChampForm from './ChampForm';
import type { DonneesMembre } from '../services/membre.service';
import type { Cooperative } from '../services/cooperative.service';

type Props = {
  initial: {
    nomMembre: string;
    prenomMembre: string;
    telephoneMembre: string;
    fokotanyMembre: string;
    idCoop: string;
  };
  cooperatives: Cooperative[];
  coopVerrouillee?: boolean;
  libelleBouton: string;
=======
import type { CSSProperties, FormEvent } from 'react';
import type { Cooperative } from '../services/cooperative.service';
import type { DonneesMembre } from '../services/membre.service';

type Props = {
  initial: DonneesMembre;
  cooperatives: Cooperative[];
  coopVerrouillee: boolean;
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  onSubmit: (d: DonneesMembre) => Promise<string | null>;
  onAnnuler: () => void;
};

<<<<<<< HEAD
type Cle = 'coop' | 'nom' | 'prenom' | 'telephone' | 'fokotany';
type Erreurs = Partial<Record<Cle, string>>;

const TELEPHONE_RE = /^\+?\d{9,13}$/;

export default function FormulaireMembre({
  initial,
  cooperatives,
  coopVerrouillee = false,
=======
export default function FormulaireMembre({
  initial,
  cooperatives,
  coopVerrouillee,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  libelleBouton,
  onSubmit,
  onAnnuler,
}: Props) {
<<<<<<< HEAD
  const [idCoop, setIdCoop] = useState(initial.idCoop);
  const [nom, setNom] = useState(initial.nomMembre);
  const [prenom, setPrenom] = useState(initial.prenomMembre);
  const [telephone, setTelephone] = useState(initial.telephoneMembre);
  const [fokotany, setFokotany] = useState(initial.fokotanyMembre);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [bandeau, setBandeau] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const coop = cooperatives.find((c) => c.idCoop === idCoop);

  function controler(): boolean {
    const e: Erreurs = {};
    if (!idCoop) e.coop = 'Choisissez une coopérative';
    if (nom.trim() === '') e.nom = 'Le nom est obligatoire';
    if (prenom.trim() === '') e.prenom = 'Le prénom est obligatoire';
    if (fokotany.trim() === '') e.fokotany = 'Le fokontany est obligatoire';
    const tel = telephone.replace(/\s/g, '');
    if (tel !== '' && !TELEPHONE_RE.test(tel)) e.telephone = 'Numéro invalide (9 à 13 chiffres)';
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBandeau('');
    if (!controler()) return;
    setEnvoi(true);
    const message = await onSubmit({
      nomMembre: nom.trim(),
      prenomMembre: prenom.trim(),
      telephoneMembre: telephone.replace(/\s/g, ''),
      fokotanyMembre: fokotany.trim(),
      idCoop,
    });
    if (message) setBandeau(message);
    setEnvoi(false);
  }

  return (
    <form className="form-carte" onSubmit={handleSubmit} noValidate>
      <h2 className="form-titre">Informations du membre</h2>
      <p className="form-sous-titre">Le district et la commune sont repris de la coopérative.</p>

      <div className="form-grille">
        <ChampForm id="membre-coop" label="Coopérative" icone={Building2} obligatoire pleine erreur={erreurs.coop}>
          {coopVerrouillee ? (
            <input
              id="membre-coop"
              className="form-input"
              value={coop ? `${coop.nomCoop} (${coop.idCoop})` : idCoop}
              readOnly
            />
          ) : (
            <select
              id="membre-coop"
              className={`form-select${erreurs.coop ? ' invalide' : ''}`}
              value={idCoop}
              onChange={(e) => setIdCoop(e.target.value)}
            >
              <option value="">-- Choisir une coopérative --</option>
              {cooperatives.map((c) => (
                <option key={c.idCoop} value={c.idCoop}>
                  {c.nomCoop} ({c.idCoop})
                </option>
              ))}
            </select>
          )}
        </ChampForm>

        <ChampForm id="membre-district" label="District" icone={MapPin} aide="Repris de la coopérative">
          <input id="membre-district" className="form-input" value={coop?.districtCoop ?? ''} readOnly />
        </ChampForm>

        <ChampForm id="membre-commune" label="Commune" icone={MapPin} aide="Repris de la coopérative">
          <input id="membre-commune" className="form-input" value={coop?.communeCoop ?? ''} readOnly />
        </ChampForm>

        <ChampForm id="membre-nom" label="Nom" icone={User} obligatoire erreur={erreurs.nom}>
          <input
            id="membre-nom"
            className={`form-input${erreurs.nom ? ' invalide' : ''}`}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            maxLength={100}
          />
        </ChampForm>

        <ChampForm id="membre-prenom" label="Prénom" icone={User} obligatoire erreur={erreurs.prenom}>
          <input
            id="membre-prenom"
            className={`form-input${erreurs.prenom ? ' invalide' : ''}`}
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            maxLength={100}
          />
        </ChampForm>

        <ChampForm
          id="membre-telephone"
          label="Téléphone"
          icone={Phone}
          erreur={erreurs.telephone}
          aide="Facultatif, 9 à 13 chiffres"
        >
          <input
            id="membre-telephone"
            className={`form-input${erreurs.telephone ? ' invalide' : ''}`}
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Ex. 034 12 345 67"
          />
        </ChampForm>

        <ChampForm id="membre-fokotany" label="Fokontany" icone={MapPin} obligatoire erreur={erreurs.fokotany}>
          <input
            id="membre-fokotany"
            className={`form-input${erreurs.fokotany ? ' invalide' : ''}`}
            value={fokotany}
            onChange={(e) => setFokotany(e.target.value)}
            maxLength={100}
          />
        </ChampForm>
      </div>

      {bandeau && <div className="form-bandeau-erreur">{bandeau}</div>}

      <div className="form-actions">
        <button type="button" className="form-btn-secondaire" onClick={onAnnuler}>
          <X size={16} /> Annuler
        </button>
        <button type="submit" className="form-btn-principal" disabled={envoi}>
          <Save size={16} /> {envoi ? 'Enregistrement…' : libelleBouton}
=======
  const [form, setForm] = useState<DonneesMembre>(initial);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // district et commune viennent de la coopérative : jamais saisis
  const coop = cooperatives.find((c) => c.idCoop === form.idCoop);

  function modifier(cle: keyof DonneesMembre, valeur: string) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!form.idCoop) {
      setErreur('Choisissez une coopérative');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit(form);
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = {
    width: '100%',
    padding: 8,
    marginBottom: 14,
    boxSizing: 'border-box',
  };

  const lecture: CSSProperties = {
    ...input,
    background: 'var(--fond-side)',
    color: 'var(--texte-doux)',
  };

  const label: CSSProperties = {
    display: 'block',
    marginBottom: 4,
    color: 'var(--texte-doux)',
    fontSize: 13,
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
      <label style={label}>Coopérative</label>
      <select
        style={input}
        value={form.idCoop}
        disabled={coopVerrouillee}
        onChange={(e) => modifier('idCoop', e.target.value)}
        required
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop} ({c.idCoop})
          </option>
        ))}
      </select>

      <label style={label}>District (selon la coopérative)</label>
      <input style={lecture} value={coop?.districtCoop ?? ''} readOnly />

      <label style={label}>Commune (selon la coopérative)</label>
      <input style={lecture} value={coop?.communeCoop ?? ''} readOnly />

      <label style={label}>Nom</label>
      <input
        style={input}
        value={form.nomMembre}
        onChange={(e) => modifier('nomMembre', e.target.value)}
        required
      />

      <label style={label}>Prénom</label>
      <input
        style={input}
        value={form.prenomMembre}
        onChange={(e) => modifier('prenomMembre', e.target.value)}
        required
      />

      <label style={label}>Téléphone</label>
      <input
        style={input}
        type="tel"
        value={form.telephoneMembre}
        onChange={(e) => modifier('telephoneMembre', e.target.value)}
      />

      <label style={label}>Fokontany</label>
      <input
        style={input}
        value={form.fokotanyMembre}
        onChange={(e) => modifier('fokotanyMembre', e.target.value)}
        required
      />

      {erreur && <p style={{ color: '#ef4444' }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" className="btn-primary" disabled={envoi}>
          {envoi ? 'Enregistrement...' : libelleBouton}
        </button>
        <button
          type="button"
          onClick={onAnnuler}
          style={{
            background: 'none',
            border: '1px solid var(--bordure)',
            color: 'var(--texte-doux)',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer',
          }}
        >
          Annuler
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
        </button>
      </div>
    </form>
  );
}