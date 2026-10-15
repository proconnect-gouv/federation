#language: fr
@ignoreInteg01 @hybridge
Fonctionnalité: Authentification cross-device (XDA)

  Contexte:
    Etant donné que la base de données est réinitialisée

  Scénario: Consultation et examen depuis une session active d'une demande d'authentification cross-device initiée sur un autre navigateur
    Etant donné que j'ai une session active sur le FI RIE avec l'email "xda@fi-rie.fr" sur le navigateur RIE
    Quand j'utilise le navigateur "internet"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "xda@fi-rie.fr"
    Et que je clique sur le bouton de connexion
    Et que la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité "fia-rie-low"
    Et que je clique sur le bouton "Se connecter via un appareil vérifié"
    Et que je suis redirigé vers la page d'authentification cross-device
    Et que je clique sur le bouton "Commencer l'authentification"
    Et que je suis redirigé vers la page d'attente d'authentification cross-device
    Et que j'utilise le navigateur "RIE"
    Et que je navigue sur la page "/api/v2/cross-device-authentication-requests"
    Alors je vois une seule demande d'authentification cross-device
    Quand je clique sur le bouton "Examiner"
    Alors je vois les emojis de la demande d'authentification cross-device
    Quand je clique sur le bouton "Approuver"
    Alors je suis redirigé vers la liste des demandes d'authentification cross-device en cours
    Et je ne vois aucune demande d'authentification cross-device
    Quand je retourne sur la page d'attente d'authentification cross-device du navigateur internet
    Alors je vois que l'authentification cross-device est approuvée

  Scénario: Le bouton Se connecter via un appareil vérifié n'est pas affiché si le FS n'a pas activé l'authentification cross-device
    Etant donné que je navigue sur la page fournisseur de service "second FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "xda@fi-rie.fr"
    Quand je clique sur le bouton de connexion
    Alors la page d'avertissement d'utilisation du hybridge s'affiche pour le fournisseur d'identité "fia-rie-low"
    Et le bouton "Se connecter via un appareil vérifié" n'est pas affiché
