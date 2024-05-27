# koa/cors

La configuration CORS permet à un serveur de spécifier quels domaines sont autorisés à lui envoyer des requêtes.

## Situation

### 1. Problème pour les versions < 5 ([github advisory](https://github.com/koajs/cors/security/advisories/GHSA-qxrj-hx23-xp82)) :

Par défaut, si aucune origine n'est spécifiée dans la configuration de koa/cors, alors le middleware renvoie la valeur du header `Origin` de la requête dans le header `Access-Control-Allow-Origin` de la réponse.

```plaintext
if an allowed origin is not provided, it will return an Access-Control-Allow-Origin header with the value of the origin from the request
```

**Autrement dit, toutes les origines sont autorisées par défaut**, ce qui est risqué sauf si cela est explicitement prévu pour des API ouvertes par exemple.

➡️ **D'après le rapport d'advisory de GitHub, le comportement par défaut devrait être restrictif plutôt qu'ouvert.**

### 2. Solution apportée dans la version 5 : ([commit](https://github.com/koajs/cors/commit/f31dac99f5355c41e7d4dd3c4a80c5f154941a11))

Par défaut, si aucune origine n'est spécifiée dans la configuration de koa/cors, alors le middleware renvoie `*` dans le header `Access-Control-Allow-Origin` de la réponse. Il faut mettre `credentials` à `true` pour que le middleware renvoie le `requestOrigin` comme dans les versions précédentes.

```plaintext
origin `Access-Control-Allow-Origin`, default is `*`
If `credentials` are set to true, the `origin` default value will be set to the request `Origin` header
```

### 3. Risque comparatif entre les versions

Un contributeur externe [a fait très justement remarquer](https://github.com/koajs/cors/commit/f31dac99f5355c41e7d4dd3c4a80c5f154941a11#r136196219) que **la modification apportée ne change absolument rien au comportement par défaut** :

- Renvoyer `*` à la place de `requestOrigin` est pratiquement identique : n'importe quelle page web peut faire une requête, à l'exception des requêtes avec identifiants (cookies) qui seront désormais rejetées.
- Cependant, les requêtes avec identifiants étaient également rejetées par défaut dans les versions précédentes.

## Contre-mesures

koa/cors est utilisée uniquement par la librairie panva. Nous utilisons actuellement la version 7.14.3 de la librairie panva.

- Nous pensons tout d'abord que **la modification apportée par la version 5 ne modifie pas le risque dénoncé par l'advisory de GitHub**. La configuration CORS par défaut permet toujours de contourner les règles de SOP (Same Origin Policy) des navigateurs.
- Ensuite, nous utilisons la politique de configuration appelée clientBasedCORS par panva. Cette politique permet de personnaliser les règles CORS en fonction du contexte de chaque requête (client metadata).
- Dans la version 7, panva mentionne `Default clientBasedCORS helper return value is now false, you must ergo use this helper to open up cors based on your policy.` [commit](https://github.com/panva/node-oidc-provider/commit/4cf4cc6f0191aa8b320c7760ea41d4ea7d90c8cd).
- La configuration CORS par défaut mise en place par la librairie panva est donc restrictive, limitant ainsi le risque de contournement des règles de SOP.
