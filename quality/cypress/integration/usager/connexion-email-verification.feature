#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - Email verification
  Scénario: le FI n'est pas MFA-compliant mais j'utilise un e-mail passe-droit
    Etant donné que je navigue sur la page fournisseur de service
    Et que la base de données est réinitialisée
    Et que le fournisseur de service requiert le claim "acr" avec les valeurs "eidas0 eidas0-mfa"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test+mfa@fia2.fr"
    Quand je clique sur le bouton de connexion
    Alors la page du FI affiche requestedAcrs "eidas0 eidas0-mfa" 

 Scénario: on vérifie mon e-mail, je rafraîchis, un seul e-mail est envoyé
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "acr" avec les valeurs "eidas0-mfa eidas1-mfa eidas2 eidas3"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "pc@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas1"
    Et que la page du FI n'affiche pas de requestedAcrs
    Et que je m'authentifie
    Et que je suis redirigé vers la page de vérification de l'email
    Et qu'un e-mail a été envoyé à "pc@fia2.fr"
    Et que je rafraîchis la page
    Alors la boîte de réception contient 1 e-mail

  Scénario: on vérifie mon e-mail mais je rentre le mauvais code
    Etant donné que je navigue sur la page fournisseur de service
    Et que la base de données est réinitialisée
    Et que le fournisseur de service requiert le claim "acr" avec les valeurs "eidas0-mfa eidas1-mfa eidas2 eidas3"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "pc@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas1"
    Et que la page du FI n'affiche pas de requestedAcrs
    Et que je m'authentifie
    Et que je suis redirigé vers la page de vérification de l'email
    Et qu'un e-mail a été envoyé à "pc@fia2.fr"
    Et que je rentre le code de confirmation " 00000000 "
    Alors je vois le message d'erreur "Le code rentré est invalide ou expiré."

  Scénario: on vérifie mon e-mail, je rentre le bon code
    Etant donné que je navigue sur la page fournisseur de service
    Et que la base de données est réinitialisée
    Et que le fournisseur de service requiert le claim "acr" avec les valeurs "eidas0-mfa eidas1-mfa eidas2 eidas3"
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "pc@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que j'utilise un compte usager dont le FI fournit un amr "pwd"
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas1"
    Et que la page du FI n'affiche pas de requestedAcrs
    Et que je m'authentifie
    Et que je suis redirigé vers la page de vérification de l'email
    Et qu'un e-mail a été envoyé à "pc@fia2.fr"
    Et que je vois un bouton "Recevoir un nouveau code" désactivé
    Et que je rentre le code de confirmation reçu par e-mail
    Alors la cinématique a utilisé le niveau de sécurité "eidas1-mfa"
    Et la cinématique a renvoyé l'amr "pwd,mail"

  Scénario: la session est ré-utilisée si un autre fournisseur de service demande le même ACR
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que le fournisseur de service requiert le claim "acr" avec la valeur "eidas1-mfa"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "pc@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas1"
    Et que je m'authentifie
    Et que je suis redirigé vers la page de vérification de l'email
    Et qu'un e-mail a été envoyé à "pc@fia2.fr"
    Et que je vois un bouton "Recevoir un nouveau code" désactivé
    Et que je rentre le code de confirmation reçu par e-mail
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que la cinématique a utilisé le niveau de sécurité "eidas1-mfa"
    Et que je navigue sur la page fournisseur de service "second FS"
    Et que le fournisseur de service requiert le claim "acr" avec la valeur "eidas1-mfa"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page fournisseur de service "second FS"
    Et je suis connecté au fournisseur de service

  Scénario: on vérifie mon e-mail, je fais trop de tentatives
    Etant donné que je navigue sur la page fournisseur de service
    Et que la base de données est réinitialisée
    Et que le fournisseur de service requiert le claim "acr" avec les valeurs "eidas0-mfa eidas1-mfa eidas2 eidas3"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "pc+aaaaaaaaa@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas1"
    Et que la page du FI n'affiche pas de requestedAcrs
    Et que je m'authentifie
    Et que je suis redirigé vers la page de vérification de l'email
    Et qu'un e-mail a été envoyé à "pc+aaaaaaaaa@fia2.fr"
    Et que je rentre le code de confirmation "00000000" 10 fois
    Et que je vois le message d'erreur "Le code rentré est invalide ou expiré."
    Et que je rentre le code de confirmation "00000000"
    Alors je vois le message d'erreur "Vous avez dépassé le nombre de tentatives autorisées. Veuillez réessayer plus tard."

