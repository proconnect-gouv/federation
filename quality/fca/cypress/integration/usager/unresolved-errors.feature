#language: fr
@ignore
Fonctionnalité: Reproduction d'erreur non résolues
  Scénario: Retour en arrière après une connexion réussie
    Étant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis connecté au fournisseur de service
    Quand je reviens en arrière
    Quand je reviens en arrière
    # Currently, an error Y030029 occurs instead of the expected behavior below
    Alors je suis redirigé vers la page interaction

  Scénario: Retour en arrière après une connexion multi FI réussie
    Étant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@polyfi.fr"
    Et que je clique sur le bouton de connexion
    Et je choisis le fournisseur d'identité "Identity Provider 1 - eIDAS faible - ES256"
    Et que je m'authentifie
    Et que je suis connecté au fournisseur de service
    Quand je reviens en arrière
    Quand je reviens en arrière
    # Currently, an error Y420001 occurs instead of the expected behavior below
    Alors je suis redirigé vers la page permettant la selection d'un fournisseur d'identité
    Quand je reviens en arrière
    Alors je suis redirigé vers la page interaction
