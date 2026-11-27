import express from 'express';
<<<<<<< HEAD
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pool } from './config/db';
import { initTempsReel } from './realtime';
=======
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
import authRoutes from './routes/auth.routes';
import utilisateurRoutes from './routes/utilisateur.routes';
import cooperativeRoutes from './routes/cooperative.routes';
import membreRoutes from './routes/membre.routes';
import produitRoutes from './routes/produit.routes';
import recolteRoutes from './routes/recolte.routes';
import stockRoutes from './routes/stock.routes';
import commandeRoutes from './routes/commande.routes';
import conversationRoutes from './routes/conversation.routes';
import livraisonRoutes from './routes/livraison.routes';
<<<<<<< HEAD
import dashboardRoutes from './routes/dashboard.routes';
import notificationRoutes from './routes/notification.routes';
import factureRoutes from './routes/facture.routes';
import statistiquesRoutes from './routes/statistiques.routes';
import transformationRoutes from './routes/transformation.routes';
=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

<<<<<<< HEAD
// Fichiers de la messagerie et factures PDF
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

=======
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
app.get('/', (_req, res) => {
  res.send('API SOAM : OK');
});

<<<<<<< HEAD
// Authentification et comptes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

// Tableaux de bord, notifications, statistiques
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/statistiques', statistiquesRoutes);

=======
// Authentification et gestion des comptes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
// Métier
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/recoltes', recolteRoutes);
app.use('/api/stock', stockRoutes);
<<<<<<< HEAD
app.use('/api/transformations', transformationRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/livraisons', livraisonRoutes);

=======
app.use('/api/commandes', commandeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/livraisons', livraisonRoutes);

// Contrôle de la connexion à la base
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
app.get('/db-test', async (_req, res) => {
  try {
    const heure = await pool.query('SELECT NOW() AS heure');
    const tables = await pool.query(
      `SELECT COUNT(*)::int AS nb FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'`
    );
    res.json({
      connexion: 'OK',
      base: 'bdSoam',
      heure: heure.rows[0].heure,
      nombreTables: tables.rows[0].nb,
    });
  } catch (err) {
    res.status(500).json({ connexion: 'ECHEC', erreur: (err as Error).message });
  }
});

<<<<<<< HEAD
// Serveur HTTP unique : l'API et le temps réel partagent le même port
const port = Number(process.env.PORT) || 3000;
const serveur = http.createServer(app);
initTempsReel(serveur);
serveur.listen(port, () => console.log(`Serveur sur http://localhost:${port}`));
=======
const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Serveur sur http://localhost:${port}`));
>>>>>>> 78ccc1e1f40b0ac5b57023caa90716bb855aac28
