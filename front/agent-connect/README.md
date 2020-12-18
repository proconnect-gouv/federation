# Utiliser des données d'api local

> Permet d'avoir un jeu de données bouchées et de profiter du hot-reload pour du dévelopement plus rapide

- ajouter le fichier `/public/mock-api-data.json`
- ajouter le fichier `/.env`

**.env**

```
REACT_APP_API_MOCK_DATA_FILE=/mock-api-data.json
```

# Architecture du dossier `src`

**src/index.ts**

- gère les composants/décorateurs principaux de l'application (redux, router...)
- charge `applicationlayout` qui permet l'affichage des éléments architecturaux principaux (header/footer) communs aux pages

**src/application-layout**

- responsable de l'affichage du header/footer
- responsable de la page a afficher requêtée par le navigateur

**src/routes.ts**

- fichier déclaratif des routes/pages de l'application

**src/pages**

- chaque fichiers représente une page de l'application
- l'affichage de ces pages est géré par le `applicationLayout`

**src/components**

- dossier contenant les features/blocks visuels partageables entre toutes les applications

**src/constants.ts**

- fichier des constantes globales à l'application

**src/redux**

# KISS

Le dossier contient des templates de fichier

# Bootstrap

- ne pas utiliser les classes `h<n>` pour les tailles de fonts mais les classes `font-<n>`, les tailles sont définies dans le fichier `_variables.scss`

- lorsqu'on définie une couleur dans le fichier `_colors.scss` elle est alors accessible sur les classes `.border-<colorname>`, `.text-<colorname>`
