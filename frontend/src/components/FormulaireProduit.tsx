import { useState } from 'react';
import type { FormEvent } from 'react';
import { Package, Coins, Save, X } from 'lucide-react';
import ChampForm from './ChampForm';
import type { DonneesProduit } from '../services/produit.service';

type Props = {
  initial: { nomProduit: string; prixUnitaire: string };
  libelleBouton: string;
  onSubmit: (d: DonneesProduit) => Promise<string | null>;
  onAnnuler: () => void;
};

type Erreurs = Partial<Record<'nom' | 'prix', string>>;

export default function FormulaireProduit({ initial, libelleBouton, onSubmit, onAnnuler }: Props) {
  const [nom, setNom] = useState(initial.nomProduit);
  const [prix, setPrix] = useState(initial.prixUnitaire);
  const [erreurs, setErreurs] = useState<Erreurs>({});
  const [bandeau, setBandeau] = useState('');
  const [envoi, setEnvoi] = useState(false);

  function controler(): { ok: boolean; valeurPrix: number } {
    const e: Erreurs = {};
    const valeurPrix = Number(prix.trim().replace(',', '.'));
    if (nom.trim() === '') e.nom = 'Le nom du produit est obligatoire';
    if (prix.trim() === '' || !Number.isFinite(valeurPrix) || valeurPrix < 0) {
      e.prix = 'Saisissez un prix positif ou nul';
    }
    setErreurs(e);
    return { ok: Object.keys(e).length === 0, valeurPrix };
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setBandeau('');
    const { ok, valeurPrix } = controler();
    if (!ok) return;
    setEnvoi(true);
    const message = await onSubmit({ nomProduit: nom.trim(), prixUnitaire: valeurPrix });
    if (message) setBandeau(message);
    setEnvoi(false);
  }

  return (
    <form className="form-carte" onSubmit={handleSubmit} noValidate>
      <h2 className="form-titre">Informations du produit</h2>
      <p className="form-sous-titre">Le prix sert au calcul des commandes et des factures.</p>

      <div className="form-grille">
        <ChampForm id="produit-nom" label="Nom du produit" icone={Package} obligatoire pleine erreur={erreurs.nom}>
          <input
            id="produit-nom"
            className={`form-input${erreurs.nom ? ' invalide' : ''}`}
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Ex. PATATE DOUCE"
            maxLength={100}
            autoFocus
          />
        </ChampForm>

        <ChampForm
          id="produit-prix"
          label="Prix unitaire (Ar par kg)"
          icone={Coins}
          obligatoire
          erreur={erreurs.prix}
          aide="Ariary par kilogramme"
        >
          <input
            id="produit-prix"
            type="number"
            min="0"
            step="0.01"
            className={`form-input${erreurs.prix ? ' invalide' : ''}`}
            value={prix}
            onChange={(e) => setPrix(e.target.value)}
            placeholder="Ex. 1500"
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