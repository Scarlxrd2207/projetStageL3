import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, ShoppingCart, Truck, AlertTriangle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { getNotifications } from '../services/notification.service';
import type { NotificationItem } from '../services/notification.service';
import { useMaj } from '../hooks/useTempsReel';
import { lireSession } from '../utils/session';
import { lireVus, ecrireVus } from '../utils/vu';
import { useLangue } from '../context/LangueContext';
import AlerteStock from './AlerteStock';

const ICONES: Record<NotificationItem['type'], LucideIcon> = {
  MESSAGE: MessageSquare,
  COMMANDE: ShoppingCart,
  LIVRAISON: Truck,
  STOCK: AlertTriangle,
};

// "2026-11-18T14:25:00" devient "18/11 14:25"
function formaterDate(iso: string): string {
  const [date, heure = ''] = iso.split('T');
  const [, mois, jour] = date.split('-');
  return `${jour}/${mois} ${heure.slice(0, 5)}`;
}

export default function ClocheNotifications() {
  const navigate = useNavigate();
  const { t } = useLangue();
  const idUser = lireSession()?.idUser ?? '';

  const [ouvert, setOuvert] = useState(false);
  const [liste, setListe] = useState<NotificationItem[]>([]);
  const [vu, setVu] = useState<number>(() => lireVus(idUser).notifications ?? 0);

  const charger = useCallback(() => {
    getNotifications()
      .then((d) => {
        setListe(d.notifications);
        setVu((v) => Math.min(v, d.notifications.length));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    charger();
    const minuterie = setInterval(charger, 30000);
    window.addEventListener('focus', charger);
    return () => {
      clearInterval(minuterie);
      window.removeEventListener('focus', charger);
    };
  }, [charger]);

  useMaj(charger);

  function basculer() {
    const nouvelEtat = !ouvert;
    setOuvert(nouvelEtat);
    if (nouvelEtat) {
      ecrireVus(idUser, { ...lireVus(idUser), notifications: liste.length });
      setVu(liste.length);
    }
  }

  function ouvrir(n: NotificationItem) {
    setOuvert(false);
    navigate(n.lien);
  }

  const badge = Math.max(0, liste.length - vu);

  return (
    <>
      <button type="button" className="bouton-icone" aria-label={t('notif.titre')} onClick={basculer}>
        <Bell size={20} />
        {badge > 0 && <span className="cloche-badge">{badge > 9 ? '9+' : badge}</span>}
      </button>

      <AlerteStock />

      {ouvert && (
        <>
          <div className="overlay-leger" onClick={() => setOuvert(false)} />
          <div className="cloche-panneau">
            <div className="cloche-entete">
              <strong>{t('notif.titre')}</strong>
              <span className="texte-doux petit">
                {liste.length} {t('notif.aTraiter')}
              </span>
            </div>

            {liste.length === 0 && (
              <p className="texte-doux" style={{ padding: 16 }}>{t('notif.vide')}</p>
            )}

            {liste.map((n) => {
              const Icone = ICONES[n.type];
              return (
                <div key={n.id} className="notif-item" onClick={() => ouvrir(n)}>
                  <span className="notif-icone">
                    <Icone size={18} />
                  </span>
                  <div className="notif-corps">
                    <div className="notif-titre">{n.titre}</div>
                    <div className="notif-contenu">{n.contenu}</div>
                    <div className="notif-date">{formaterDate(n.date)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}