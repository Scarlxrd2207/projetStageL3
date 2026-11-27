export type District = { nom: string; communes: string[] };

export const DISTRICTS: District[] = [
  { nom: 'Fianarantsoa', communes: ['Fianarantsoa'] },
  {
    nom: 'Lalangina',
    communes: [
      'Alakamisy Ambohimaha', 'Alatsinainy Ialamarina', 'Ambalakely', 'Ambalamahasoa',
      'Andrainjato Centre', 'Andrainjato Est', 'Androy', 'Fandrandava', 'Ialananindro',
      'Ivoamba', 'Mahatsinjony', 'Sahambavy', 'Taindambo',
    ],
  },
  {
    nom: 'Isandra',
    communes: [
      'Isorana', 'Ambalamidera II', 'Ambondrona', 'Andoharanomaintso', 'Anjoma Itsara',
      'Ankarinarivo Manirisoa', 'Fanjakana', 'Iavinomby Vohibola', 'Mahazoarivo',
      'Nasandratrony', 'Soatanana', 'Bekatra', 'Tsarasoatra',
    ],
  },
  {
    nom: 'Vohibato',
    communes: [
      'Alakamisy Itenina', 'Andranomiditra', 'Andranovorivato', 'Ankaromalaza Mifanasoa',
      'Ihazoara', 'Mahaditra', 'Mahasoabe', 'Maneva', 'Soaindrana', 'Talata Ampano',
      'Vinanitelo', 'Vohibato Ouest', 'Vohimarina', 'Vohitrafeno', 'Lamosina',
    ],
  },
  {
    nom: 'Ambalavao',
    communes: [
      'Ambalavao', 'Ambinanindovoka', 'Ambinanindroa', 'Ambohimahamasina', 'Ambohimandroso',
      'Andrainjato', 'Anjoma', 'Ankaramena', 'Besoa', 'Fenoarivo', 'Iarintsena', 'Kirano',
      'Mahazony', 'Manamisoa', 'Miarinarivo', 'Sendrisoa', 'Vohitsaoka',
    ],
  },
  {
    nom: 'Ambohimahasoa',
    communes: [
      'Ambohimahasoa', 'Ambalakindresy', 'Ambatosoa', 'Ambohinamboarina', 'Ampitana',
      'Ankafina Tsarafidy', 'Ankerana', 'Befeta', 'Camp Robin', 'Fiadanana', 'Isaka',
      'Kalalao', 'Manandroy', 'Morafeno', 'Sahatona', 'Sahave', 'Vohiposa', 'Ikalalao',
    ],
  },
  {
    nom: 'Ikalamavony',
    communes: [
      'Ikalamavony', 'Ambatomainty', 'Fitampito', 'Mangidy', 'Sakay', 'Solila',
      'Tanamarina Bekisopa', 'Tsitondroina',
    ],
  },
];

export const NOMS_DISTRICTS = DISTRICTS.map((d) => d.nom);

export const TOUTES_LES_COMMUNES = DISTRICTS.flatMap((d) => d.communes);

export function communesDe(nomDistrict: string): string[] {
  return DISTRICTS.find((d) => d.nom === nomDistrict)?.communes ?? [];
}