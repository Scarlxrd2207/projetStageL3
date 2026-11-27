import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

const DOSSIER = path.join(__dirname, '..', '..', 'uploads', 'messages');
fs.mkdirSync(DOSSIER, { recursive: true });

const EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.docx', '.xlsx', '.txt'];

const stockage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DOSSIER),
  filename: (_req, file, cb) =>
    cb(null, crypto.randomUUID() + path.extname(file.originalname).toLowerCase()),
});

const televersement = multer({
  storage: stockage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
  if (EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
},
}).single('fichier');

// Transforme les erreurs de téléversement en réponses lisibles
export function televerserFichier(req: Request, res: Response, next: NextFunction) {
  televersement(req, res, (err: unknown) => {
    if (err) {
      const msg = (err as Error).message;
      const texteErreur = msg.includes('File too large')
        ? 'Fichier trop volumineux (5 Mo maximum)'
        : msg;
      return res.status(400).json({ message: texteErreur });
    }
    next();
  });
}