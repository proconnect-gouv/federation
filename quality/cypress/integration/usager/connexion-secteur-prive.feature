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

  @ignoreInteg01
  Scénario: Une session obtenue auprès d'un FS acceptant le privé ne permet pas de se connecter à un FS public
    Étant donné que je navigue sur la page fournisseur de service "acceptant le privé"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@example.com"
    Et que je clique sur le bouton de connexion
    Et que j'utilise un compte usager d'une organisation privée
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "acceptant le privé"
    Et que je suis connecté au fournisseur de service
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que je paramètre un intercepteur pour ne pas afficher la page interaction
    Et que je clique sur le bouton ProConnect
    Quand je navigue directement sur la page de vérification de l'interaction
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500015"
