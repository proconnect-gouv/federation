#language: fr
@ignoreDocker
Fonctionnalité: Connexion Usager - ACR with PCI
  Scénario: Ne déclenche pas de mfa dans ProConnect Identité si pas demandé par le FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "acr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user-mfa-proconnect-ci1@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je rentre un mot de passe valide sur ProConnect Identité
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "https://proconnect.gouv.fr/assurance/consistency-checked"

  Scénario: Déclenche une mfa dans ProConnect Identité si demandé par le FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user-mfa-proconnect-ci2@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je rentre un mot de passe valide sur ProConnect Identité
    Et que je rentre un totp valide sur ProConnect Identité
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service

  Scénario: Déclenche un parcours mfa dans ProConnect Identité si le FS demande une mise à niveau de la session
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user-mfa-proconnect-ci3@yopmail.com"
    Et que je clique sur la checkbox "se souvenir de moi"
    Quand je clique sur le bouton de connexion
    Et que je rentre un mot de passe valide sur ProConnect Identité
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Lorsque le fournisseur de service requiert un niveau de sécurité "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"
    Et que je clique sur le bouton ProConnect
    Quand je clique sur le bouton de connexion
    Alors je rentre un totp valide sur ProConnect Identité
    Et je suis redirigé vers la page fournisseur de service "par défaut"

  Scénario: Déclenche une mfa dans ProConnect Identité si demandé par le FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "https://proconnect.gouv.fr/assurance/consistency-checked-2fa"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user-mfa-proconnect-ci4@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je rentre un mot de passe valide sur ProConnect Identité
    Et que je rentre un totp valide sur ProConnect Identité
    Et je suis redirigé vers la page fournisseur de service "par défaut"

  Scénario: Déclenche un parcours certification dirigeant dans ProConnect Identité si demandé par le FS
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "https://proconnect.gouv.fr/assurance/certification-dirigeant"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "user-proconnect-ci@yopmail.com"
    Quand je clique sur le bouton de connexion
    Et que je rentre un mot de passe valide sur ProConnect Identité
    Et que je sélectionne une organisation publique sur ProConnect Identité
    Et que je clique sur le bouton FranceConnect
