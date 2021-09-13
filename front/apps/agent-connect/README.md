# AGENT CONNECT

## Développement Local

> Permet d'économiser les ressources d'une machine.

- ajouter le fichier `/.env.development.local`

```bach
BROWSER=none
API_PROXY_HOST=/
API_PROXY_FOR_PATH=/
REACT_APP_API_MOCK_DATA_FILE=/data.mock.json
```

- ajouter le fichier `/public/data.mock.json`

```json
{
  // récupérer les données de l'API depuis la console
  "ministries": [],
  "identityProviders": []
}
```

- lancer le serveur local avec la commande `yarn start`
- visiter l'URL `localhost:3000/api/v2/interaction/abcd`
