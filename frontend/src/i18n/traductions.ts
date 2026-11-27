export type Langue = 'fr' | 'mg';

export const LANGUES: { code: Langue; libelle: string }[] = [
  { code: 'fr', libelle: 'Français' },
  { code: 'mg', libelle: 'Malagasy' },
];

// Chaque clé doit exister dans les deux langues.
// Si une clé manque en malagasy, le texte français s'affiche (voir LangueContext).
export const TRADUCTIONS: Record<Langue, Record<string, string>> = {
  fr: {
    // Barre latérale et menus
    'menu.navigation': 'Navigation',
    'menu.ouvrir': 'Ouvrir le menu',
    'menu.replier': 'Replier le menu',
    'menu.tableau': 'Tableau de bord',
    'menu.statistiques': 'Statistiques',
    'menu.cooperatives': 'Coopératives',
    'menu.presidents': 'Présidents',
    'menu.produits': 'Produits',
    'menu.membres': 'Membres',
    'menu.recoltes': 'Récoltes',
    'menu.stock': 'Stock',
    'menu.commandes': 'Commandes',
    'menu.commandesRecues': 'Commandes reçues',
    'menu.livraisons': 'Livraisons',
    'menu.messages': 'Messages',
    'menu.profil': 'Mon profil',

    // Rôles
    'role.responsable': 'Responsable SOAM',
    'role.president': 'Président',

    // Notifications
    'notif.titre': 'Notifications',
    'notif.aTraiter': 'à traiter',
    'notif.vide': 'Rien à traiter pour le moment.',

    // Profil
    'profil.titre': 'Mon profil',
    'profil.compte': 'Mon compte',
    'profil.securite': 'Sécurité',
    'profil.parametres': 'Paramètres',
    'profil.deconnexion': 'Déconnexion',
    'profil.confirmerDeconnexion': 'Voulez-vous vraiment vous déconnecter ?',
    'profil.infos': 'Informations du compte',
    'profil.identifiant': 'Identifiant',
    'profil.email': 'E-mail',
    'profil.role': 'Rôle',
    'profil.cooperative': 'Coopérative',

    // Sécurité (mot de passe)
    'securite.titre': 'Modifier le mot de passe',
    'securite.actuel': 'Mot de passe actuel',
    'securite.nouveau': 'Nouveau mot de passe (6 caractères minimum)',
    'securite.confirmer': 'Confirmer le nouveau mot de passe',
    'securite.bouton': 'Modifier le mot de passe',
    'securite.ok': 'Mot de passe modifié',

    // Paramètres (thème et langue)
    'param.apparence': 'Apparence',
    'param.apparenceDesc': "Choisissez le thème de l'application. Votre choix est conservé sur ce navigateur.",
    'param.clair': 'Mode clair',
    'param.sombre': 'Mode sombre',
    'param.langue': 'Langue',
    'param.langueDesc': "Choisissez la langue de l'application. Votre choix est conservé sur ce navigateur.",

    // Communs
    'commun.enregistrer': 'Enregistrer',
    'commun.annuler': 'Annuler',
    'commun.chargement': 'Chargement...',
  },

  mg: {
    // Barre latérale et menus
    'menu.navigation': 'Fitaratra',
    'menu.ouvrir': 'Sokafy ny lisitra',
    'menu.replier': 'Akatona ny lisitra',
    'menu.tableau': 'Takelaka fitantanana',
    'menu.statistiques': 'Statistika',
    'menu.cooperatives': 'Koperatif',
    'menu.presidents': "Filohan'ny koperatif",
    'menu.produits': 'Vokatra',
    'menu.membres': 'Mpikambana',
    'menu.recoltes': 'Fijinjana',
    'menu.stock': 'Stock',
    'menu.commandes': 'Filaharana',
    'menu.commandesRecues': 'Filaharana voaray',
    'menu.livraisons': 'Fampitaterana',
    'menu.messages': 'Hafatra',
    'menu.profil': 'Ny mombamomba ahy',

    // Rôles
    'role.responsable': 'Mpitantana SOAM',
    'role.president': "Filohan'ny koperatif",

    // Notifications
    'notif.titre': 'Fampandrenesana',
    'notif.aTraiter': 'mila hotsaina',
    'notif.vide': "Tsy misy zavatra hatao amin'izao fotoana izao.",

    // Profil
    'profil.titre': 'Ny mombamomba ahy',
    'profil.compte': 'Ny kaontiko',
    'profil.securite': 'Fiarovana',
    'profil.parametres': 'Fikirana',
    'profil.deconnexion': 'Hivoaka',
    'profil.confirmerDeconnexion': 'Tena te hivoaka ve ianao ?',
    'profil.infos': 'Vaovao momba ny kaonty',
    'profil.identifiant': 'Laharana fanamarinana',
    'profil.email': 'Mailaka',
    'profil.role': 'Andraikitra',
    'profil.cooperative': 'Koperatif',

    // Sécurité (mot de passe)
    'securite.titre': 'Ovaina ny tenimiafina',
    'securite.actuel': 'Tenimiafina ankehitriny',
    'securite.nouveau': 'Tenimiafina vaovao (litera 6 farafahakeliny)',
    'securite.confirmer': 'Hamarino ny tenimiafina vaovao',
    'securite.bouton': 'Ovaina ny tenimiafina',
    'securite.ok': 'Voaova ny tenimiafina',

    // Paramètres (thème et langue)
    'param.apparence': 'Endrika',
    'param.apparenceDesc': "Safidio ny lohahevitra ampiasaina amin'ny rindrambaiko. Voatahiry amin'ity navigateur ity ny safidinao.",
    'param.clair': 'Endrika mazava',
    'param.sombre': 'Endrika maizina',
    'param.langue': 'Fiteny',
    'param.langueDesc': "Safidio ny fiteny ampiasaina amin'ny rindrambaiko. Voatahiry amin'ity navigateur ity ny safidinao.",

    // Communs
    'commun.enregistrer': 'Hatahiry',
    'commun.annuler': 'Hanafoana',
    'commun.chargement': 'Mandeha...',
  },
};