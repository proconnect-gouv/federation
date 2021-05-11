# cookie-signature

## Situation

Checkmarx signale une vulnérabilité sur le package [`cookie-signature`](https://www.npmjs.com/package/cookie-signature) en version inférieure à `1.1.0`.

> The node-cookie-signature package before 1.1.0 is vulnerable to timing attacks. The unsign() function in file index.js uses a weak ('==') comparison between the hashed values of `mac` and `value`, which doesn't completely protect against timing attack, allowing an attacker to enumerate the value. [Cxceacc68c-fe31](https://github.com/tj/node-cookie-signature/issues/21)

Cette librairie est une sous dépendance d'autres dépendances, nous ne pouvons pas simplement mettre à jour la version utilisée dans la section `dependencies` du fichier package.json.

## Contre mesures

Nous utilisons la fonctionnalité [`resolutions`](https://classic.yarnpkg.com/en/docs/selective-version-resolutions) de yarn, pour forcer l'utilisation de la version ne présentant pas la vulnérabilité.

**NB :** Cette modification déclenche une alerte de non compatibilité (niveau "warning") lors de l'installation des dépendances ou d'un audit yarn, mais dans les faits les deux versions restent compatibles pour nos usages.  
La seule différence entre les deux version et le [changement de la méthode de validation](https://github.com/tj/node-cookie-signature/blob/master/History.md#110--2018-01-18) détectée par checkmarx comme vulnérable.
