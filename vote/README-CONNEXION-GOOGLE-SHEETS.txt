CS AMANI — CONNEXION GOOGLE SHEETS

Feuille utilisée :
https://docs.google.com/spreadsheets/d/1RIQAbMHS5ITWWv7KgRsC7giMQyU1FKcpO_aGlOgKALc/edit

Important : l’URL Google Sheets ci-dessus n’est PAS l’URL API du site.
Le navigateur doit appeler le déploiement Google Apps Script en /exec.

1. Ouvrir le fichier Google Sheets.
2. Extensions > Apps Script.
3. Coller vote/backend/apps-script.gs.
4. Remplacer CHANGE-MOI par un code administrateur privé.
5. Déployer > Nouveau déploiement > Application Web.
6. Exécuter en tant que : Moi.
7. Accès : Toute personne disposant du lien.
8. Copier l’URL /exec dans vote/js/config.js à la place de SCRIPT_URL.
9. Laisser MODE: "sheets".

Les options utilisées par l’élection sont exactement celles du registre CS Amani :
- 7ème — Éducation des Bases
- 8ème — Éducation des Bases
- 1ère à 4ème — Technique sociale
- 1ère à 4ème — Technique nutrition
- 1ère à 4ème — Technique commerciale & gestion

Aucune option Mécanique, Électricité, Coupe et Couture ou Construction n’est utilisée par le module d’élection.


ETAPE UNIQUE RESTANTE
----------------------
Le fichier Google Sheets utilisé est :
https://docs.google.com/spreadsheets/d/1RIQAbMHS5ITWWv7KgRsC7giMQyU1FKcpO_aGlOgKALc/edit

Important : le navigateur ne doit pas appeler directement docs.google.com.
Il faut une URL Web App Google Apps Script se terminant par /exec.

Dans Google Sheets : Extensions > Apps Script > coller vote/backend/apps-script.gs > Déployer > Nouveau déploiement > Application Web > Exécuter en tant que moi > accès toute personne disposant du lien.

Puis remplacer dans vote/js/config.js :
SCRIPT_URL: "COLLER_ICI_URL_EXEC_APPS_SCRIPT"
par l'URL /exec fournie par Google.

Le code du site ne bascule plus silencieusement en mode démo si SCRIPT_URL est vide : il signale maintenant que le backend n'est pas configuré.
