import { useState } from 'react';
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
  onSubmit: (d: DonneesMembre) => Promise<string | null>;
  onAnnuler: () => void;
};

type Cle = 'coop' | 'nom' | 'prenom' | 'telephone' | 'fokotany';
type Erreurs = Partial<Record<Cle, string>>;

const TELEPHONE_RE = /^\+?\d{9,13}$/;

export default function FormulaireMembre({
  initial,
  cooperatives,
  coopVerrouillee = false,
  libelleBouton,
  onSubmit,
  onAnnuler,
}: Props) {
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
        </button>
      </div>
    </form>
  );
}