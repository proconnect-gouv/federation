#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - siret_hint
  Scénario: Le FS fournit le siret_hint à ProConnect
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service envoie le siret_hint "21340126800130"
    Quand je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Alors la page du FI affiche le siret_hint "21340126800130"
