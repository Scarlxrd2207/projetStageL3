import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { exigerPresident } from '../utils/acces';
import {
  enteteFacture,
  lignesFacture,
  type EnteteFacture,
  type LigneFacture,
} from '../repositories/facture.repository';
import {
  trouverOuCreerConversation,
  ajouterMessage,
} from '../repositories/conversation.repository';
import { notifierConversation } from '../realtime';

export type Resultat<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; message: string };

// Même dossier que la messagerie : le serveur le sert déjà sous /uploads
const DOSSIER = path.join(__dirname, '..', '..', 'uploads', 'messages');
fs.mkdirSync(DOSSIER, { recursive: true });

const STATUTS_FACTURABLES = ['EN_COURS_LIVRAISON', 'LIVREE'];

export function numeroFacture(idCommande: string): string {
  return `FAC-${idCommande}`;
}

function somme(n: number): string {
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} Ar`;
}

// Construit le PDF en mémoire et renvoie son contenu
function construirePdf(e: EnteteFacture, lignes: LigneFacture[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const morceaux: Buffer[] = [];
    doc.on('data', (m: Buffer) => morceaux.push(m));
    doc.on('end', () => resolve(Buffer.concat(morceaux)));
    doc.on('error', reject);

    // En-tête
    doc.font('Helvetica-Bold').fontSize(20).text('SOAM');
    doc.font('Helvetica').fontSize(10).text('Facture d\'approvisionnement');
    doc.moveDown(1.5);

    // Informations de la facture
    doc.font('Helvetica-Bold').fontSize(12).text(`Facture n° ${numeroFacture(e.idCommande)}`);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Date de commande : ${e.dateCommande}`);
    doc.text(`Date d'acceptation : ${e.dateAcceptation ?? '—'}`);
    doc.moveDown(1);

    // Fournisseur et acheteur
    doc.font('Helvetica-Bold').text('Fournisseur :');
    doc.font('Helvetica').text(`Coopérative ${e.nomCoop} (${e.idCoop})`);
    doc.moveDown(0.5);
    doc.font('Helvetica-Bold').text('Acheteur :');
    doc.font('Helvetica').text(`SOAM, représentée par ${e.emailResponsable}`);
    doc.moveDown(1.5);

    // Tableau des lignes
    const colonnes = { produit: 50, quantite: 260, prix: 360, montant: 460 };
    let y = doc.y;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Produit', colonnes.produit, y);
    doc.text('Quantité (kg)', colonnes.quantite, y);
    doc.text('Prix unitaire', colonnes.prix, y);
    doc.text('Montant', colonnes.montant, y);
    y += 16;
    doc.moveTo(50, y - 4).lineTo(545, y - 4).stroke();

    doc.font('Helvetica');
    let total = 0;
    for (const l of lignes) {
      const montant = l.quantite * l.prixUnitaire;
      total += montant;
      doc.text(l.nomProduit, colonnes.produit, y, { width: 200 });
      doc.text(l.quantite.toLocaleString('fr-FR', { maximumFractionDigits: 2 }), colonnes.quantite, y);
      doc.text(somme(l.prixUnitaire), colonnes.prix, y);
      doc.text(somme(montant), colonnes.montant, y);
      y += 18;
    }

    // Total
    doc.moveTo(50, y).lineTo(545, y).stroke();
    y += 10;
    doc.font('Helvetica-Bold').text('Total', colonnes.prix, y);
    doc.text(somme(total), colonnes.montant, y);

    // Pied de page
    doc.font('Helvetica').fontSize(8).text(
      `Document généré par la plateforme SOAM le ${new Date().toLocaleDateString('fr-FR')}.`,
      50,
      760,
      { align: 'center', width: 495 }
    );

    doc.end();
  });
}

// Envoi de la facture par la messagerie : président de la coopérative de la commande uniquement
export async function envoyerFacture(
  idCommande: string,
  idUser: string
): Promise<Resultat<{ idMessage: string; numero: string }>> {
  const pres = await exigerPresident(idUser);
  if (!pres.ok) return pres;

  const entete = await enteteFacture(idCommande);
  if (!entete || entete.idCoop !== pres.idCoop) {
    return { ok: false, status: 404, message: 'Commande introuvable' };
  }

  if (!STATUTS_FACTURABLES.includes(entete.statutCommande)) {
    return {
      ok: false,
      status: 409,
      message: "La facture ne peut être envoyée qu'après acceptation de la commande",
    };
  }

  const lignes = await lignesFacture(idCommande);
  if (lignes.length === 0) {
    return { ok: false, status: 400, message: 'Aucune quantité confirmée sur cette commande' };
  }

  const sansPrix = [...new Set(lignes.filter((l) => !(l.prixUnitaire > 0)).map((l) => l.nomProduit))];
  if (sansPrix.length > 0) {
    return {
      ok: false,
      status: 400,
      message: `Prix non défini pour : ${sansPrix.join(', ')}. Renseignez le prix des produits avant d'envoyer la facture.`,
    };
  }

  const pdf = await construirePdf(entete, lignes);
  const nomStocke = `${crypto.randomUUID()}.pdf`;
  fs.writeFileSync(path.join(DOSSIER, nomStocke), pdf);

  const numero = numeroFacture(idCommande);
  const url = `/uploads/messages/${nomStocke}`;

  // La facture part dans la discussion avec le responsable qui a passé la commande
  const idConversation = await trouverOuCreerConversation(entete.idCoop, entete.idUserResponsable);
  const idMessage = await ajouterMessage(idConversation, idUser, `FICHIER|${numero}.pdf|${url}`);

  notifierConversation(entete.idCoop, { type: 'message', idCoop: entete.idCoop, idConversation });
  return { ok: true, status: 201, data: { idMessage, numero } };
}