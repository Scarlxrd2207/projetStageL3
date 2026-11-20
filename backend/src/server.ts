import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db';
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

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('API SOAM : OK');
});

// Authentification et gestion des comptes
app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);

// Métier
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/membres', membreRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/recoltes', recolteRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/livraisons', livraisonRoutes);

// Contrôle de la connexion à la base
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

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Serveur sur http://localhost:${port}`));