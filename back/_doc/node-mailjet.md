# node-mailjet

## Situation

Suite a la montée de version de la librairie "[openid-client](https://github.com/panva/node-openid-client)" la dépendance "[got](https://github.com/sindresorhus/got)" s'est retrouvée [mise à jour](https://github.com/panva/node-openid-client/blob/master/CHANGELOG.md#-breaking-changes).

Depuis cette mise à jour, les requêtes faîtes par `got` ne passent plus par notre proxy. Ce bug est dû à la sous-sous dépendance "[agent-base](https://github.com/TooTallNate/node-agent-base)" du package "[node-mailjet](https://github.com/mailjet/mailjet-apiv3-nodejs)":

```
$ npm ls agent-base

fc@0.0.2 /home/stephane/Projets/franceconnect/fc/back
└─┬ node-mailjet@3.3.1
  └─┬ superagent-proxy@1.0.3
    └─┬ proxy-agent@2.3.1
      ├── agent-base@4.3.0
      ├─┬ http-proxy-agent@2.1.0
      │ └── agent-base@4.3.0  deduped
      ├─┬ https-proxy-agent@2.2.4
      │ └── agent-base@4.3.0  deduped
      ├─┬ pac-proxy-agent@2.0.2
      │ └── agent-base@4.3.0  deduped
      └─┬ socks-proxy-agent@3.0.1
        └── agent-base@4.3.0  deduped
```

La librairie `agent-base` en version 4.3.0 "[patch des fonctions natives de NodeJS](https://github.com/TooTallNate/node-agent-base/issues/35)" ce qui peut créer des soucis sur des librairies utilisant des proxies (en l'occurence chez `openid-client`: `got`).

## Contre mesures

Une [PR existe et est à surveiller](https://github.com/mailjet/mailjet-apiv3-nodejs/pull/134) pour la mise à jour de la dépendance [superagent-proxy](https://github.com/TooTallNate/superagent-proxy). En attendant les versions ont été fixées dans le `package.json`:

```json
"superagent": "6.1.0",
"superagent-proxy": "2.1.0"
```
