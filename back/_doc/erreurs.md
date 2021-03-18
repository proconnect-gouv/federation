# Erreur specs


| Code | Message utilisateur | Description |
|---|---|---|
| Y000003 | Erreur technique non communiqué à l&#39;usager | Il manque des informations techniques dans la requête HTTP, ne devrait pas se produire, contacter le SN3 |
| Y000004 | Erreur tehnique, veuillez recommencer votre connexion | Des étapes de la cinématique ont été sautées (identitée non disponible en session, l&#39;usager doit redémarrer sa cinématique depuis le FS) |
| Y000005 | Invalid csrf | La page de consentement a été appelée sans avoir effectuer les étapes de la cinématique (redirection vers le FS) |
| Y000006 | No authenticationEmail feature handler set in database | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y010004 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP a trouvé un echo mais pas suffisement proche de l&#39;identité fournie |
| Y010006 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP a trouvé plusieurs echos pour l&#39;identité fournie |
| Y010007 | Une erreur est survenue dans la transmission de votre identité | Demande identifiée avec le nom d&#39;usage uniquement |
| Y010008 | Une erreur est survenue dans la transmission de votre identité | Le RNIPP n&#39;a pas trouvé l&#39;identité fournie |
| Y010009 | Erreur technique | Erreur de communication avec le RNIPP (demande rejetée par le RNIPP) |
| Y010011 | Erreur technique | Erreur de communication avec le RNIPP (pas de réponse du RNIPP) |
| Y010012 | Une erreur est survenue dans la transmission de votre identité | Impossible de joindre le RNIPP |
| Y010013 | Erreur technique | Erreur techniquer lors de l&#39;appel RNIPP, contacter SN3 |
| Y010015 | Erreur technique | L&#39;usager est décedé |

| Code | Message utilisateur | Description |
|---|---|---|
| Y020000 | Erreur technique | Erreur techique dans le protocole OIDC, contacter SN3 (FC &gt; FI) |
| Y020001 |  | Le niveau eidas renvoyé par le Fournisseur d&#39;identité est plus faible que celui demandé par le fournisseur de service |
| Y020002 | Invalid ACR | Le niveau eidas demandé par le FS ou renvoyé par le FI n&#39;est pas supporté par la plateforme |
| Y020017 | La connexion via ce fournisseur d&#39;identité est désactivée | Le Fi est désactivé |
| Y020019 | Ce fournisseur d&#39;identité est inconnu | Le Fi n&#39;existe pas |
| Y020021 | Erreur technique | La requête reçue au retour du FI n&#39;est pas valide (pas de code de state), problème probable avec le FI, contacter le SN3 |
| Y020022 | Erreur technique, recommencez votre cinématique | La requête reçue au retour du FI n&#39;est pas valide (state invalide), recommencer la cinématique depuis le FS |
| Y020023 | the identity provider id:undefined is blacklisted by service provider id:Error | N/A |
| Y020025 | Erreur technique, recommencez votre cinématique | La requête reçue au retour du FI n&#39;est pas valide (pas de code d&#39;autorisation), recommencer la cinématique depuis le FS |

| Code | Message utilisateur | Description |
|---|---|---|
| Y030002 |  | Problème d&#39;initialisation du wrapper oidc-provider |
| Y030004 | Erreur technique | Problème d&#39;initialisation du wrapper oidc-provider |
| Y030005 | Erreur technique, recommencez la cinématique | Erreur technique, recommencer et contact le SN3 si l&#39;erreur persiste |
| Y030006 | Erreur technique | Erreur technique, recomencer la cinématique, contacter SN3 si l&#39;erreur persiste |
| Y030025 | Erreur technique, recommenez la cinématique | La cinématique n&#39;a pas été retrouvée, recommencer la cinématique depuis le FS |

| Code | Message utilisateur | Description |
|---|---|---|
| Y050001 |  | N/A |

| Code | Message utilisateur | Description |
|---|---|---|
| Y060001 |  | Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible d&#39;écrire la LightRequest dans le cache ApacheIgnite. Le cache est probablement injoignable.) |
| Y060002 |  | Problème de connexion entre le bridge eidas et le noeud eidas contacter le SN3 (Impossible de récupérer la LightResponse dans le cache ApacheIgnite. L&#39;id est invalide, la réponse a expirée ou le cache est injoignable.) |

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
| Y160001 | Erreur technique | Erreur technique (communication avec le HSM), contacter le SN3 |

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
| Y190002 | Error | La Session présente une erreur de format de données |

