import { useEffect, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import type { Cooperative } from '../services/cooperative.service';
import type { Recolte } from '../services/recolte.service';
import { getRecoltes } from '../services/recolte.service';
import type { LigneSaisie } from '../services/commande.service';

type Props = {
  cooperatives: Cooperative[];
  // renvoie null si succès, sinon le message d'erreur à afficher
  onSubmit: (idCoop: string, lignes: LigneSaisie[]) => Promise<string | null>;
  onAnnuler: () => void;
};

// "2026-11-18" devient "18/11/2026"
function formaterDate(iso: string): string {
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

export default function FormulaireCommande({ cooperatives, onSubmit, onAnnuler }: Props) {
  const [idCoop, setIdCoop] = useState('');
  const [recoltes, setRecoltes] = useState<Recolte[]>([]);
  // quantité saisie par récolte ; une récolte sans saisie n'est pas commandée
  const [saisie, setSaisie] = useState<Record<string, string>>({});
  const [erreur, setErreur] = useState('');
  const [envoi, setEnvoi] = useState(false);

  // Changer de coopérative réinitialise la saisie
  useEffect(() => {
    setSaisie({});
    setErreur('');
    if (!idCoop) {
      setRecoltes([]);
      return;
    }
    getRecoltes(idCoop)
      .then((liste) => setRecoltes(liste.filter((r) => r.quantiteRestante > 0)))
      .catch(() => setRecoltes([]));
  }, [idCoop]);

  function modifierQuantite(idRecolte: string, valeur: string) {
    setSaisie((s) => ({ ...s, [idRecolte]: valeur }));
  }

  // Lignes réellement saisies, avec la quantité convertie en nombre
  function lignesSaisies(): LigneSaisie[] {
    return Object.entries(saisie)
      .filter(([, v]) => v.trim() !== '')
      .map(([idRecolte, v]) => ({
        idRecolte,
        quantiteDemandee: Number(v.replace(',', '.')),
      }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErreur('');

    if (!idCoop) {
      setErreur('Choisissez une coopérative');
      return;
    }

    const lignes = lignesSaisies();
    if (lignes.length === 0) {
      setErreur('Saisissez une quantité pour au moins une récolte');
      return;
    }
    if (lignes.some((l) => !(l.quantiteDemandee > 0))) {
      setErreur('Chaque quantité doit être supérieure à 0');
      return;
    }

    // Contrôle local avant envoi : la quantité ne dépasse pas ce qui est disponible
    for (const l of lignes) {
      const r = recoltes.find((x) => x.idRecolte === l.idRecolte);
      if (r && l.quantiteDemandee > r.quantiteRestante) {
        setErreur(`Quantité trop élevée pour ${r.nomProduit} (${r.quantiteRestante} kg disponibles)`);
        return;
      }
    }

    setEnvoi(true);
    const message = await onSubmit(idCoop, lignes);
    if (message) setErreur(message);
    setEnvoi(false);
  }

  const input: CSSProperties = { padding: 8, boxSizing: 'border-box' };
  const label: CSSProperties = { display: 'block', marginBottom: 4, color: 'var(--texte-doux)', fontSize: 13 };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label style={label}>Coopérative</label>
      <select
        style={{ ...input, width: '100%', marginBottom: 16 }}
        value={idCoop}
        onChange={(e) => setIdCoop(e.target.value)}
      >
        <option value="">-- Choisir une coopérative --</option>
        {cooperatives.map((c) => (
          <option key={c.idCoop} value={c.idCoop}>
            {c.nomCoop}
          </option>
        ))}
      </select>

      {idCoop && recoltes.length === 0 && (
        <p style={{ color: 'var(--texte-doux)' }}>Aucune récolte disponible pour cette coopérative.</p>
      )}

      {recoltes.length > 0 && (
        <table className="table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Membre</th>
              <th>Date de récolte</th>
              <th>Disponible</th>
              <th>Quantité demandée (kg)</th>
            </tr>
          </thead>
          <tbody>
            {recoltes.map((r) => (
              <tr key={r.idRecolte}>
                <td>{r.nomProduit}</td>
                <td>{r.prenomMembre} {r.nomMembre}</td>
                <td>{formaterDate(r.dateRecolte)}</td>
                <td>{r.quantiteRestante.toLocaleString('fr-FR')} kg</td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    max={r.quantiteRestante}
                    value={saisie[r.idRecolte] ?? ''}
                    onChange={(e) => modifierQuantite(r.idRecolte, e.target.value)}
                    style={{ ...input, width: 140 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {erreur && <p style={{ color: '#ef4444', marginTop: 12 }}>{erreur}</p>}

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <button type="submit" className="btn-primary" disabled={envoi}>
          {envoi ? 'Enregistrement...' : 'Enregistrer la commande'}
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
        </button>
      </div>
    </form>
  );
}