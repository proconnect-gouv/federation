#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - login_hint

  Scénario: Connexion initiale + login_hint
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Quand j'entre l'email "fia@fia1.fr"
    Et que je clique sur le bouton de connexion
    Alors je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et le champ identifiant correspond à "fia@fia1.fr"
