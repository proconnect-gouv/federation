# body-parser

## Situation

Checkmarx renvoi une alerte sur l'utilisation de la librairie body-parser, qui présenterait un risque de pollution de prototype :

> The package [`body-parser`](https://github.com/expressjs/body-parser) is vulnerable to prototype pollution, as it does no sanitation to the values received via the incoming JSON data. A remote attacker can inject a `__proto__` object to the application, which would successfully be parsed on the server side. This affects the integrity of the application. [Cx14b19a02-387a](https://gist.github.com/rgrove/3ea9421b3912235e978f55e291f19d5d/revisions)

Nous n'utilisons pas la fonctionnalité concernée par l'alerte : le middleware renvoyé par la méthode `json()` exposé par la librairie.

Cette libraire est une sous-dépendance, importée par `@nestjs/express-platform`, la librairie qui fait le pont entre le cœeur de NestJS et Express. NestJS ne permet pas de configurer finement l'initialisation des middlewares fournis par `body-parser`, il est revanche possible de les désactiver totalement.

## Contre mesures

Bien que nous n'utilision pas la fonctionnalité incriminée, nous la désactivons afin d'expliciter le risque et de prévenir d'une utilisation future sans considération :

L'initialisation des middlewares `body-parser` est totalement désactivée :

```typescript
const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  bodyParser: false,
});
```

Nous initialisons nous même le seul middleware qui nous est utile est qui ne fait pas partie de la faille remontée, [`urlencoded`](https://github.com/expressjs/body-parser#bodyparserurlencodedoptions) :

```typescript
app.use(urlencoded({ extended: false }));
```

**NB :** Bien que le middleware `urlencoded` ne soit pas visé par l'alerte checkmarx, nous considérons que le mode `extended` (qui s'appui sur la librairie [`qs`](https://github.com/ljharb/qs)) présente des risques similaires de pollution de prototype. Nous désactivons donc ce mode (activé par défaut).
