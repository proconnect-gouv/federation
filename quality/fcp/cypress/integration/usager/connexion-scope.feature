#language: fr
@usager @connexionScope
Fonctionnalité: Connexion Usager - Scope
  En tant qu'usager d'un fournisseur de service,
  je veux me connecter en utilisant un fournisseur d'identité
  afin de communiquer certaines informations personnelles au fournisseur de service

  Plan du Scénario: Connexion d'un usager - scope <scopeType>
    Etant donné que le fournisseur de service requiert l'accès aux informations des scopes "<scopeType>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que je choisis un fournisseur d'identité actif
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je m'authentifie avec un compte actif
    Et je suis redirigé vers la page confirmation de connexion
    Et les informations demandées par le fournisseur de service correspondent aux scopes "<scopeType>"
    Et j'accepte de transmettre mes informations au fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté
    Et le fournisseur de service a accès aux informations des scopes "<scopeType>"

    Exemples:
    | scopeType                 |
    | tous les scopes           |
    | profile sans alias        |
    | identite_pivot sans alias |
    | address                   |
    | birth                     |
    | profile                   |
    | identite_pivot            |

  Scénario: Connexion d'un usager - scope anonyme
    Etant donné que le fournisseur de service requiert l'accès aux informations du scope "anonyme"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que je choisis un fournisseur d'identité actif
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je m'authentifie avec un compte actif
    Et je suis redirigé vers la page confirmation de connexion
    Et aucune information demandée par le fournisseur de service pour le scope "anonyme"
    Et j'accepte de transmettre mes informations au fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté
    Et le fournisseur de service a accès aux informations du scope "anonyme"

  Scénario: Connexion d'un usager - erreur FS non habilité pour ce scope
    Etant donné que le fournisseur de service est habilité à demander le scope "identite_pivot"
    Et que le fournisseur de service requiert l'accès aux informations du scope "address"
    Et que je navigue sur la page fournisseur de service
    Quand je clique sur le bouton FranceConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_scope"
    Et la description de l'erreur fournisseur de service est "requested scope is not whitelisted"

  Scénario: Connexion d'un usager - attribut scope inconnu ignoré
    Etant donné que le fournisseur de service requiert l'accès aux informations des scopes "profile avec scope inconnu"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que je choisis un fournisseur d'identité actif
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je m'authentifie avec un compte actif
    Et je suis redirigé vers la page confirmation de connexion
    Et les informations demandées par le fournisseur de service correspondent aux scopes "profile"
    Et j'accepte de transmettre mes informations au fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté
    Et le fournisseur de service a accès aux informations des scopes "profile"
