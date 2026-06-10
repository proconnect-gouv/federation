#language: fr
Fonctionnalité: Connexion Partenaires
  Plan du Scénario: Erreur "privé non autorisé" Y500015
    Étant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@example.com"
    Et que je clique sur le bouton de connexion
    Et que j'utilise un compte usager d'une organisation privée
    Quand je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500015"
    Et le lien vers le support est affiché
    Et le message d'erreur est "The user's roles are: []; the user is linked to the non-public organization: Octo-technology (SIRET: 41816609600069)"
    Et le lien est celui par défaut avec le fs "<spName>", le fi "<idpName>" et l'erreur "Y500015"

    @ignoreInteg01
    Exemples:
      | spName         | idpName      |
      | FSA - FSA1-LOW | moncomptepro |

    @k8s @ignoreInteg01 @ignoreDocker
    Exemples:
      | spName                   | idpName             |
      | Fournisseur de service 1 | ProConnect Identité |
