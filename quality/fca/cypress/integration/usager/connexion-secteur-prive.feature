#language: fr
@usager @ignoreInteg01 @ci
Fonctionnalité: Connexion Partenaires
  Scénario: Erreur "privé non autorisé" Y500015
    Étant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus.dumbledore@hogwarts.uk"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500015"
    Et le lien vers le support est affiché
    Et le href est celui par défaut avec le fs "FSA - FSA1-LOW", le fi "moncomptepro" et l'erreur "Y500015"