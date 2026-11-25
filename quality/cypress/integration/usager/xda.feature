#language: fr
@ignoreInteg01 @hybridge
Fonctionnalité: Authentification cross-device (XDA)

  Contexte:
    Etant donné que la base de données est réinitialisée

  Scénario: Consultation et examen depuis une session active d'une demande d'authentification cross-device initiée sur un autre navigateur
    Etant donné que les navigateurs sont réinitialisés
    Et que j'ai une session active sur le FI RIE avec l'email "xda@fi-rie.fr" sur le navigateur RIE
    Quand j'utilise le navigateur "internet"
    Et que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "amr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "xda@fi-rie.fr"
    Et que je clique sur le bouton de connexion
    Et que la page d'avertissement d'utilisation du hybridge s'affiche
    Et que je clique sur le bouton "Vérifier depuis l'ordinateur RIE"
    Et que je suis redirigé vers la page du parcours d'authentification cross-device
    Et que je mémorise l'URL de la page du parcours d'authentification cross-device
    Et je vois uniquement les instructions de la XDA
    Et que je clique sur le bouton "Afficher les emojis"
    Et je vois que la vérification de la XDA attend l'ordinateur RIE
    Et que le polling de la page du parcours renvoie le statut "verification_started"
    Et je vois les emojis de la XDA
    Et que je reviens en arrière
    Et que la page d'avertissement d'utilisation du hybridge s'affiche
    Et que je clique sur le bouton "Vérifier depuis l'ordinateur RIE"
    Et je suis sur l'URL mémorisée de la page du parcours d'authentification cross-device
    Et que j'utilise le navigateur "RIE"
    Et que je navigue sur la page "/api/v2/cross-device-authentication-requests"
    Alors je vois une seule demande d'authentification cross-device
    Et la demande d'authentification cross-device vient de "Paris, France"
    Quand je clique sur le bouton "Vérifier"
    Alors je vois les emojis de la demande d'authentification cross-device
    Et je ne peux pas encore approuver la demande d'authentification cross-device
    Quand j'utilise le navigateur "internet"
    Et je suis sur l'URL mémorisée de la page du parcours d'authentification cross-device
    Et que j'affiche les emojis de la XDA
    Et que j'utilise le navigateur "RIE"
    Et que je navigue sur la page "/api/v2/cross-device-authentication-requests"
    Et que je clique sur le bouton "Vérifier"
    Alors je vois les emojis de la demande d'authentification cross-device
    Et je peux approuver la demande d'authentification cross-device
    Quand je clique sur le bouton "Oui"
    Alors je vois que la demande d'authentification cross-device est approuvée sur l'ordinateur RIE
    Quand je navigue sur la page "/api/v2/cross-device-authentication-requests"
    Alors je ne vois aucune demande d'authentification cross-device
    Quand j'utilise le navigateur "internet"
    Et je suis sur l'URL mémorisée de la page du parcours d'authentification cross-device
    Alors je vois que l'authentification cross-device est approuvée
    Quand je clique sur le bouton "Continuer vers le Fournisseur de Service"
    Alors je suis connecté au fournisseur de service
    Et la cinématique a renvoyé un amr contenant "xda"
    Et que je mémorise le sub envoyé au fournisseur de service
    Quand je retourne sur l'URL mémorisée de la page du parcours d'authentification cross-device
    Alors je vois que la demande d'authentification cross-device a déjà été utilisée
    Quand je navigue sur la page "/api/v2/cross-device-authentication-requests"
    Alors je vois que cette session ne peut pas vérifier de demande d'authentification cross-device

    # La déconnexion sur ce navigateur ne change rien pour l'ordinateur RIE
    Quand je navigue sur la page fournisseur de service
    Et que je clique sur le bouton de déconnexion
    Et que je suis déconnecté du fournisseur de service
    Et que j'utilise le navigateur "RIE"
    Et que je navigue sur la page fournisseur de service
    Et que je redemande les informations de l'usager
    Alors le sub transmis au fournisseur de service est identique au sub mémorisé

  Scénario: Le bouton Vérifier depuis l'ordinateur RIE n'est pas affiché si le FS n'a pas activé l'authentification cross-device
    Etant donné que je navigue sur la page fournisseur de service "second FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "xda@fi-rie.fr"
    Quand je clique sur le bouton de connexion
    Alors la page d'avertissement d'utilisation du hybridge s'affiche
    Et le bouton "Vérifier depuis l'ordinateur RIE" n'est pas affiché
