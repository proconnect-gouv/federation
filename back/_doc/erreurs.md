# Erreur specs


| Code | Message utilisateur | Description |
|---|---|---|
| Y000003 | Erreur technique non communiquée à l&#39;usager | Il manque des informations techniques dans la requête HTTP. Cette erreur ne devrait pas se produire, contacter le service technique |
| Y000004 | Erreur technique, veuillez refaire votre connexion à partir du FS | Des étapes de la cinématique ont été omises (identité non disponible en session, l&#39;usager doit redémarrer sa cinématique depuis le FS) |
| Y000005 | Invalid csrf | La page de consentement a été appelée sans avoir effectué les étapes de la cinématique (redirection vers le FS) |
| Y000006 | No authenticationEmail feature handler set in database | N/A |
| Y000007 | Invalid identity from Error: undefined | N/A |
| Y000007 | Invalid identity from Error: undefined | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y010004 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP a trouvé un echo mais pas suffisamment proche de l&#39;identité demandée |
| Y010006 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP a trouvé plusieurs echos pour l&#39;identité fournie |
| Y010007 | Une erreur est survenue dans la transmission de votre identité | Demande identifiée avec le nom d&#39;usage uniquement |
| Y010008 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP n&#39;a pas trouvé l&#39;identité fournie |
| Y010009 | Erreur technique | Erreur de communication avec le RNIPP (demande rejetée par le RNIPP) |
| Y010011 | Erreur technique | Erreur de communication avec le RNIPP (pas de réponse du RNIPP) |
| Y010012 | Une erreur est survenue dans la transmission de votre identité | Impossible de joindre le RNIPP |
| Y010013 | Erreur technique | Erreur technique lors de l&#39;appel RNIPP, contacter le service technique |
| Y010015 | Erreur technique | L&#39;usager est décedé |

| Code | Message utilisateur | Description |
|---|---|---|
| Y020000 | Erreur technique | Erreur techique dans le protocole OIDC, contacter SN3 (FC &gt; FI) |
| Y020001 |  | Le niveau eIDAS renvoyé par le FI est plus faible que celui demandé par le FS |
| Y020002 | Invalid ACR | Le niveau eidas demandé par le FS ou renvoyé par le FI n&#39;est pas supporté par la plateforme |
| Y020017 | La connexion via ce fournisseur d&#39;identité est désactivée | Le FI est désactivé |
| Y020019 | Ce fournisseur d&#39;identité est inconnu | Le FI n&#39;existe pas |
| Y020021 | Erreur technique | La requête reçue au retour du FI n&#39;est pas valide (pas de code de state), problème probable avec le FI, contacter le service technique |
| Y020022 | Erreur technique, recommencez votre cinématique | La requête reçue au retour du FI n&#39;est pas valide (state invalide), recommencer la cinématique depuis le FS |
| Y020023 | the identity provider id:undefined is blacklisted by service provider id:Error | N/A |
| Y020025 | Erreur technique, recommencez votre cinématique | La requête reçue au retour du FI n&#39;est pas valide (pas de code d&#39;autorisation), recommencer la cinématique depuis le FS |
| Y020026 |  | N/A |
| Y020027 |  | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y030002 |  | Problème d&#39;initialisation du wrapper oidc-provider |
| Y030004 | Erreur technique | Problème d&#39;initialisation du wrapper oidc-provider |
| Y030005 | Erreur technique, recommencez la cinématique | Erreur technique, recommencer la cinématique et contacter le service technique si l&#39;erreur persiste |
| Y030006 | Erreur technique | Erreur technique, recomencer la cinématique, contacter SN3 si l&#39;erreur persiste |
| Y030025 | Erreur technique, recommenez la cinématique | La cinématique n&#39;a pas été retrouvée, recommencer la cinématique depuis le FS |

| Code | Message utilisateur | Description |
|---|---|---|
| Y050001 |  | N/A |
| Y050007 | Invalid identity from eIDAS node: {} | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y060001 |  | Problème de connexion entre le bridge eIDAS et le noeud eIDAS; contacter le service technique (impossible de récupérer la &#34;LightResponse&#34; dans le cache ApacheIgnite. Le cache est probablement injoignable) |
| Y060002 |  | Problème de connexion entre le bridge eIDAS et le noeud eIDAS; contacter le service technique (impossible de récupérer la &#34;LightResponse&#34; dans le cache ApacheIgnite. L&#39;id est invalide, la réponse a expiré ou le cache est injoignable.) |

| Code | Message utilisateur | Description |
|---|---|---|
| Y070001 |  | Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible d&#39;écrire la LightResponse dans le cache ApacheIgnite. Le cache est probablement injoignable.) |
| Y070002 |  | Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible de récupérer la LightRequest dans le cache ApacheIgnite. L&#39;id est invalide, la requête a expirée ou le cache est injoignable.) |

| Code | Message utilisateur | Description |
|---|---|---|
| Y090001 |  | N/A |
| Y090001 |  | N/A |
| Y090002 |  | N/A |
| Y090002 |  | N/A |
| Y090003 |  | N/A |
| Y090003 |  | N/A |
| Y090007 | Invalid identity from FC: {} | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y150001 | Session not found | Erreur émise lorsque l&#39;usager n&#39;a plus de session, probablement une fenêtre restée ouverte au delà des 10 minutes. |
| Y150002 |  | N/A |
| Y150003 | Should have a session cookie (timed out or wrong entry page) | N/A |
| Y150004 | Should have an interaction cookie (timed out or wrong entry page) | N/A |
| Y150005 | Bad Session id | N/A |
| Y150006 | Error | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y160001 | Erreur technique | Erreur technique (communication avec le HSM), contacter le service technique |

| Code | Message utilisateur | Description |
|---|---|---|
| Y170001 |  | N/A |
| Y170002 |  | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y180001 | Account blocked | Un utilisateur a demandé à ce que sa connexion via franceConnect soit désactivée. La connexion via ses identifiants est donc impossible désormais. Réactivation du compte nécessaire pour pouvoir procéder à une nouvelle connexion via ce compte. |

| Code | Message utilisateur | Description |
|---|---|---|
| Y190001 | Session not found | La Session n&#39;a pas été trouvée |
| Y190002 | Sessions is not formatted well. | La Session présente une erreur de format de données |
| Y190003 | Session alias is not valide | La Session présente une erreur d&#39;alias |
| Y190004 | Session is invalide | La Session n&#39;est pas valide&#39; |

| Code | Message utilisateur | Description |
|---|---|---|
| Y270001 | No email defined | Un utilisateur s&#39;est connecté à FranceConnect, il recoit un mail lui notifiant une nouvelle connection à un de ses comptes. Si l&#39;email de cet utilisateur n&#39;est pas présent cette exception sera levée |
| Y270002 | Bad or Missing connection notification email parameters | Un utilisateur s&#39;est connecté à FranceConnect, il recoit un mail lui notifiant une nouvelle connection à un de ses comptes. Si l&#39;envoi de cet mail de notification échoue, cette exception sera levée. |

