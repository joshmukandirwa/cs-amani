/* ==========================================================
   CONFIG.JS — tout ce qu'on change se change ICI.
   ========================================================== */
var CONFIG = {
  SCHOOL: "Complexe Scolaire Amani",
  TITLE: "Élection du doyen de l’école",

  /* "demo"   = tout est simulé dans le navigateur (pour tester tout de suite)
     "sheets" = vrai vote via Google Sheets (colle l'URL Apps Script ci-dessous) */
  MODE: "demo",

  /* Feuille Google Sheets actuellement utilisée par CS Amani.
     ID extrait du nouveau lien fourni par l'administration. */
  SPREADSHEET_ID: "1RIQAbMHS5ITWWv7KgRsC7giMQyU1FKcpO_aGlOgKALc",
  SPREADSHEET_URL: "https://docs.google.com/spreadsheets/d/1RIQAbMHS5ITWWv7KgRsC7giMQyU1FKcpO_aGlOgKALc/edit",

  /* IMPORTANT : ce champ doit contenir l'URL /exec du déploiement Google Apps Script,
     PAS l'URL docs.google.com/spreadsheets. */
  SCRIPT_URL: "COLLER_ICI_URL_EXEC_APPS_SCRIPT",

  /* Code admin utilisé seulement en mode demo.
     En mode "sheets", le code se règle dans le fichier backend/apps-script.gs */
  DEMO_ADMIN_CODE: "admin123",

  /* Noms et textes provisoires : remplace-les par les vrais. */
  CANDIDATES: [
    {
      id: "c1",
      name: "Aristide Muyisa",
      slogan: "La rigueur au service de la réussite",
      bio: "Enseignant depuis de longues années, il veut une école où chaque élève sait ce qu'on attend de lui.",
      points: ["Horaires respectés et suivi des absences", "Cours de rattrapage le samedi", "Dialogue mensuel avec les parents"],
      photo: "img/c1.jpg"
    },
    {
      id: "c2",
      name: "Prosper Wetu",
      slogan: "Une école qui écoute ses élèves",
      bio: "Proche des élèves, il veut que leur voix compte dans les décisions de l'école.",
      points: ["Boîte à idées et réunions avec les délégués", "Clubs : sport, musique, informatique", "Salles de classe mieux équipées"],
      photo: "img/c2.jpg"
    },
    {
      id: "c3",
      name: "Gédéon Mapendo",
      slogan: "Innover ensemble",
      bio: "Il veut moderniser l'école tout en gardant ses valeurs de discipline et de respect.",
      points: ["Salle informatique ouverte à tous", "Résultats et bulletins consultables en ligne", "Partenariats avec d'autres écoles"],
      photo: "img/c3.jpg"
    }
  ]
};
