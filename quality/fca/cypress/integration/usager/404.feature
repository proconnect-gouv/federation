#language: fr
@ignoreInteg01
Fonctionnalité: Affichage de l'erreur 404
  Scénario: Je vois une page d'erreur 404
    Etant donné que je navigue sur une page inexistante
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y000404"
    Et le message d'erreur est "Une erreur s'est produite, veuillez réessayer ultérieurement"
