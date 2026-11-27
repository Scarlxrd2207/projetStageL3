import { useState } from 'react';
import { FileText } from 'lucide-react';
import { envoyerFacture } from '../services/facture.service';
import { lireSession } from '../utils/session';

type Props = {
  idCommande: string;
  statut: string;
};

const STATUTS_FACTURABLES = ['EN_COURS_LIVRAISON', 'LIVREE'];

// Visible uniquement pour le président, et seulement après acceptation de la commande
export default function BoutonFacture({ idCommande, statut }: Props) {
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState('');
  const [erreur, setErreur] = useState('');

  const session = lireSession();
  const visible = session?.role === 'PRESIDENT' && STATUTS_FACTURABLES.includes(statut);

  if (!visible) return null;

  async function envoyer() {
    setErreur('');
    setSucces('');
    setEnvoi(true);
    try {
      const r = await envoyerFacture(idCommande);
      setSucces(`Facture ${r.numero} envoyée dans la messagerie du responsable`);
    } catch (err: any) {
      setErreur(err?.response?.data?.message ?? 'Envoi de la facture impossible');
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="btn-primary"
        disabled={envoi}
        onClick={envoyer}
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
      >
        <FileText size={18} />
        {envoi ? 'Génération du PDF…' : 'Envoyer la facture (PDF)'}
      </button>
      {succes && <span style={{ color: 'var(--accent)' }}>{succes}</span>}
      {erreur && <span style={{ color: '#ef4444' }}>{erreur}</span>}
    </div>
  );
}