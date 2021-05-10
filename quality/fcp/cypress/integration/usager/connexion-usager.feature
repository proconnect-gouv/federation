#language: fr
@usager @connexionUsager
Fonctionnalité: Connexion Usager
  En tant qu'usager d'un fournisseur de service,
  je veux me connecter en utilisant un fournisseur d'identité
  afin d'accéder à mon service

  Scénario: Connexion d'un usager - identification niveau faible
    Etant donné que le fournisseur de service est habilité à recevoir le scope "simple"
    Et que le fournisseur de service demande accès aux informations du scope "simple"
    Et que je suis sur la page 'fournisseur de service'
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page 'sélection du fournisseur d'identité'
    Et que je choisis un fournisseur d'identité avec "eidas1"
    Et que je suis redirigé vers la page 'login du fournisseur d'identité'
    Quand je m'authentifie avec succès
    Et je suis redirigé vers la page 'confirmation de connexion'
    Et les informations demandées par le fournisseur de service correspondent au scope "simple"
    Et je confirme le retour vers le fournisseur de service
    Alors je suis redirigé vers la page 'fournisseur de service'
    Et je suis connecté
    Et le fournisseur de service a accès aux informations du scope "simple"

  Scénario: Connexion d'un usager - scope anonyme
    Etant donné que le fournisseur de service est habilité à recevoir le scope "anonyme"
    Et que le fournisseur de service demande accès aux informations du scope "anonyme"
    Et que je suis sur la page 'fournisseur de service'
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page 'sélection du fournisseur d'identité'
    Et que je choisis un fournisseur d'identité avec "eidas1"
    Et que je suis redirigé vers la page 'login du fournisseur d'identité'
    Quand je m'authentifie avec succès
    Et je suis redirigé vers la page 'confirmation de connexion'
    Et aucune information demandée par le fournisseur de service pour le scope "anonyme"
    Et je confirme le retour vers le fournisseur de service
    Alors je suis redirigé vers la page 'fournisseur de service'
    Et je suis connecté
    Et le fournisseur de service a accès aux informations du scope "anonyme"
