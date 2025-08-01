#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - login_hint

  Scénario: ProConnect fournit le login_hint au FI
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Quand j'entre l'email "fia@fia1.fr"
    Et que je clique sur le bouton de connexion
    Alors je suis redirigé vers la page login du fournisseur d'identité "par défaut"
    Et le champ identifiant correspond à "fia@fia1.fr"

  Scénario: Le FS fournit le login_hint à ProConnect
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le login_hint "test-login-hint@fia1.fr"
    Quand je clique sur le bouton ProConnect
    Et que je clique sur le bouton de connexion
    Alors le champ identifiant correspond à "test-login-hint@fia1.fr"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service
    Lorsque le fournisseur de service requiert le login_hint "test-login-hint2@fia1.fr"
    Et je clique sur le bouton ProConnect
    Alors le champ email correspond à "test-login-hint2@fia1.fr"
