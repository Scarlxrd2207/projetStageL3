import { useEffect, useState } from 'react';
<<<<<<< HEAD
import type { FormEvent } from 'react';
import { Building2, User, Package, Calendar, Scale, Save, X, Info } from 'lucide-react';
import ChampForm from './ChampForm';
import { getMembres } from '../services/membre.service';
import type { Membre } from '../services/membre.service';
import type { Cooperative } from '../services/cooperative.service';
import type { Produit } from '../services/produit.service';
import type { DonneesRecolte } from '../services/recolte.service';
=======
import type { CSSProperties, FormEvent } from 'react';
import type { Cooperative } from '../services/cooperative.service';
import type { Produit } from '../services/produit.service';
import { getMembres } from '../services/membre.service';
import type { Membre } from '../services/membre.service';
import type { DonneesRecolte } from '../services/recolte.service';
import { dateAujourdhui } from '../utils/dates';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

export type ValeursRecolte = {
  idCoop: string;
  idMembre: string;
  idProduit: string;
  dateRecolte: string;
  quantiteDeclaree: string;
};

type Props = {
  initial: ValeursRecolte;
  cooperatives: Cooperative[];
  produits: Produit[];
<<<<<<< HEAD
  coopVerrouillee?: boolean;
  modeEdition?: boolean;
  libelleBouton: string;
=======
  coopVerrouillee: boolean;
  modeEdition: boolean; // en modification : coopérative, membre et produit ne changent pas
  libelleBouton: string;
  // renvoie null si succès, sinon le message d'erreur à afficher
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  onSubmit: (d: DonneesRecolte) => Promise<string | null>;
  onAnnuler: () => void;
};

<<<<<<< HEAD
type Cle = 'coop' | 'membre' | 'produit' | 'date' | 'quantite';
type Erreurs = Partial<Record<Cle, string>>;

function aujourdhui(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
export default function FormulaireRecolte({
  initial,
  cooperatives,
  produits,
<<<<<<< HEAD
  coopVerrouillee = false,
  modeEdition = false,
=======
  coopVerrouillee,
  modeEdition,
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
  libelleBouton,
  onSubmit,
  onAnnuler,
}: Props) {
<<<<<<< HEAD
  const [idCoop, setIdCoop] = useState(initial.idCoop);
  const [idMembre, setIdMembre] = useState(initial.idMembre);
  const [idProduit, setIdProduit] = useState(initial.idProduit);
  const [dateRecolte, setDateRecolte] = useState(initial.dateRecolte || aujourdhui());
  const [quantite, setQuantite] = useState(initial.quantiteDeclaree);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [bandeau, setBandeau] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Membres actifs de la coopérative choisie
  useEffect(() => {
    if (!idCoop) {
      setMembres([]);
      return;
    }
    getMembres(idCoop)
      .then((liste) => setMembres(liste.filter((m) => m.actifMembre === 'Oui')))
      .catch(() => setMembres([]));
  }, [idCoop]);

  // Changer de coopérative remet le membre à zéro
  function changerCoop(valeur: string) {
    setIdCoop(valeur);
    setIdMembre('');
  }

  function controler(): boolean {
    const e: Erreurs = {};
    if (!modeEdition) {
      if (!idCoop) e.coop = 'Choisissez une coopérative';
      if (!idMembre) e.membre = 'Choisissez le membre producteur';
      if (!idProduit) e.produit = 'Choisissez le produit';
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateRecolte)) e.date = 'Date invalide';
    else if (dateRecolte > aujourdhui()) e.date = 'La date ne peut pas être dans le futur';

    const q = Number(quantite.trim().replace(',', '.'));
    if (quantite.trim() === '' || !Number.isFinite(q) || q <= 0) {
      e.quantite = 'Saisissez une quantité supérieure à 0';
    }
    setErreurs(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBandeau('');
    if (!controler()) return;
    setEnvoi(true);
    const message = await onSubmit({
      idMembre,
      idProduit,
      dateRecolte,
      quantiteDeclaree: Number(quantite.trim().replace(',', '.')),
    });
    if (message) setBandeau(message);
    setEnvoi(false);
  }

  const coopBloquee = coopVerrouillee || modeEdition;
  const nomCoopCourant = cooperatives.find((c) => c.idCoop === idCoop)?.nomCoop ?? idCoop;

  return (
    <form className="form-carte" onSubmit={handleSubmit} noValidate>
      <h2 className="form-titre">{modeEdition ? 'Modifier la récolte' : 'Déclarer une récolte'}</h2>
      <p className="form-sous-titre">La quantité déclarée devient la quantité disponible pour les commandes.</p>

      <div className="form-grille">
        <ChampForm id="rec-coop" label="Coopérative" icone={Building2} obligatoire pleine erreur={erreurs.coop}>
          {coopBloquee ? (
            <input id="rec-coop" className="form-input" value={nomCoopCourant} readOnly />
          ) : (
            <select
              id="rec-coop"
              className={`form-select${erreurs.coop ? ' invalide' : ''}`}
              value={idCoop}
              onChange={(e) => changerCoop(e.target.value)}
            >
              <option value="">-- Choisir une coopérative --</option>
              {cooperatives.map((c) => (
                <option key={c.idCoop} value={c.idCoop}>
                  {c.nomCoop}
                </option>
              ))}
            </select>
          )}
        </ChampForm>

        <ChampForm id="rec-membre" label="Membre producteur" icone={User} obligatoire erreur={erreurs.membre}>
          <select
            id="rec-membre"
            className={`form-select${erreurs.membre ? ' invalide' : ''}`}
            value={idMembre}
            onChange={(e) => setIdMembre(e.target.value)}
            disabled={modeEdition || !idCoop}
          >
            <option value="">
              {idCoop ? '-- Choisir un membre --' : "Choisissez d'abord la coopérative"}
            </option>
            {membres.map((m) => (
              <option key={m.idMembre} value={m.idMembre}>
                {m.prenomMembre} {m.nomMembre}
              </option>
            ))}
          </select>
        </ChampForm>

        <ChampForm id="rec-produit" label="Produit" icone={Package} obligatoire erreur={erreurs.produit}>
          <select
            id="rec-produit"
            className={`form-select${erreurs.produit ? ' invalide' : ''}`}
            value={idProduit}
            onChange={(e) => setIdProduit(e.target.value)}
            disabled={modeEdition}
          >
            <option value="">-- Choisir un produit --</option>
            {produits.map((p) => (
              <option key={p.idProduit} value={p.idProduit}>
                {p.nomProduit}
              </option>
            ))}
          </select>
        </ChampForm>

        <ChampForm id="rec-date" label="Date de récolte" icone={Calendar} obligatoire erreur={erreurs.date}>
          <input
            id="rec-date"
            type="date"
            className={`form-input${erreurs.date ? ' invalide' : ''}`}
            value={dateRecolte}
            max={aujourdhui()}
            onChange={(e) => setDateRecolte(e.target.value)}
          />
        </ChampForm>

        <ChampForm
          id="rec-quantite"
          label="Quantité déclarée"
          icone={Scale}
          obligatoire
          erreur={erreurs.quantite}
          aide="En kilogrammes"
        >
          <input
            id="rec-quantite"
            type="number"
            min="0"
            step="0.01"
            className={`form-input${erreurs.quantite ? ' invalide' : ''}`}
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            placeholder="Ex. 150"
          />
        </ChampForm>
      </div>

      {modeEdition && (
        <div className="form-note">
          <Info size={16} />
          Seules la date et la quantité peuvent être modifiées. Le membre et le produit restent figés.
        </div>
      )}

      {bandeau && <div className="form-bandeau-erreur">{bandeau}</div>}

      <div className="form-actions">
        <button type="button" className="form-btn-secondaire" onClick={onAnnuler}>
          <X size={16} /> Annuler
        </button>
        <button type="submit" className="form-btn-principal" disabled={envoi}>
          <Save size={16} /> {envoi ? 'Enregistrement…' : libelleBouton}
=======
  const [form, setForm] = useState<ValeursRecolte>(initial);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  const coop = cooperatives.find((c) => c.idCoop === form.idCoop);

  // Membres de la coopérative choisie (en modification, on garde aussi les inactifs)
  useEffect(() => {
    if (!form.idCoop) {
      setMembres([]);
      return;
    }
    getMembres(form.idCoop)
      .then((liste) => setMembres(modeEdition ? liste : liste.filter((m) => m.actifMembre === 'Oui')))
      .catch(() => setMembres([]));
  }, [form.idCoop, modeEdition]);

  function modifier(cle: keyof ValeursRecolte, valeur: string) {
    setForm((f) => ({ ...f, [cle]: valeur }));
  }

  // Changer de coopérative réinitialise le membre
  function changerCoop(id: string) {
    setForm((f) => ({ ...f, idCoop: id, idMembre: '' }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    const quantite = Number(form.quantiteDeclaree.replace(',', '.'));

    if (!form.idCoop) {
      setErreur('Choisissez une coopérative');
      return;
    }
    if (!form.idMembre) {
      setErreur('Choisissez un membre');
      return;
    }
    if (!form.idProduit) {
      setErreur('Choisissez un produit');
      return;
    }
    if (!form.dateRecolte) {
      setErreur('La date de récolte est obligatoire');
      return;
    }
    if (form.dateRecolte > dateAujourdhui()) {
      setErreur('La date de récolte ne peut pas être dans le futur');
      return;
    }
    if (!(quantite > 0)) {
      setErreur('La quantité doit être supérieure à 0');
      return;
    }

    setEnvoi(true);
    const message = await onSubmit({
      idMembre: form.idMembre,
      idProduit: form.idProduit,
      dateRecolte: form.dateRecolte,
      quantiteDeclaree: quantite,
    });
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { width: '100%', padding: 8, marginBottom: 14, boxSizing: 'border-box' };
  const lecture: CSSProperties = { ...input, background: 'var(--fond-side)', color: 'var(--texte-doux)' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} noValidate style={{ maxWidth: 560 }}>
      <label style={label}>Coopérative</label>
      <select
        style={input}
        value={form.idCoop}
        disabled={coopVerrouillee || modeEdition}
        onChange={(e) => changerCoop(e.target.value)}
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop} ({c.idCoop})
          </option>
        ))}
      </select>

      <label style={label}>Membre producteur</label>
      <select
        style={input}
        value={form.idMembre}
        disabled={modeEdition || !form.idCoop}
        onChange={(e) => modifier('idMembre', e.target.value)}
      >
        <option value="">
          {form.idCoop ? '-- Choisir un membre --' : "-- Choisissez d'abord une coopérative --"}
        </option>
        {membres.map((m) => (
          <option key={m.idMembre} value={m.idMembre}>
            {m.prenomMembre} {m.nomMembre}
          </option>
        ))}
      </select>

      <label style={label}>Produit</label>
      <select
        style={input}
        value={form.idProduit}
        disabled={modeEdition}
        onChange={(e) => modifier('idProduit', e.target.value)}
      >
        <option value="">-- Choisir un produit --</option>
        {produits.map((p) => (
          <option key={p.idProduit} value={p.idProduit}>
            {p.nomProduit}
          </option>
        ))}
      </select>

      <label style={label}>District (selon la coopérative)</label>
      <input style={lecture} value={coop?.districtCoop ?? ''} readOnly />

      <label style={label}>Commune (selon la coopérative)</label>
      <input style={lecture} value={coop?.communeCoop ?? ''} readOnly />

      <label style={label}>Date de récolte</label>
      <input
        style={input}
        type="date"
        max={dateAujourdhui()}
        value={form.dateRecolte}
        onChange={(e) => modifier('dateRecolte', e.target.value)}
      />

      <label style={label}>Quantité récoltée (kg)</label>
      <input
        style={input}
        type="number"
        min="0"
        step="0.01"
        value={form.quantiteDeclaree}
        onChange={(e) => modifier('quantiteDeclaree', e.target.value)}
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