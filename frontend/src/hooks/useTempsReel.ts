import { useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import type { Maj, EnLigne } from '../services/socket';

// Appelle `surMaj` à chaque événement "maj" envoyé par le serveur.
// Le nettoyage retire l'écouteur quand le composant est démonté ou que la fonction change.
export function useMaj(surMaj: (m: Maj) => void): void {
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const ecouteur = (m: Maj) => surMaj(m);
    s.on('maj', ecouteur);

    return () => {
      s.off('maj', ecouteur);
    };
  }, [surMaj]);
}

// Liste des présidents actuellement connectés, mise à jour en direct
export function usePresence(): EnLigne[] {
  const [liste, setListe] = useState<EnLigne[]>([]);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const ecouteur = (l: EnLigne[]) => setListe(l);
    s.on('presence', ecouteur);

    return () => {
      s.off('presence', ecouteur);
    };
  }, []);

  return liste;
}