#language: fr
@ignoreInteg01
Fonctionnalité: Affichage de l'erreur 404
  Scénario: Je vois une page d'erreur 404
    Etant donné que je navigue sur la page "/api/v2/not-found"
    Alors je suis redirigé vers la page erreur technique
    Et le titre de la page d'erreur est "Page non trouvée"
    Et le code d'erreur est "Y000404"
    Et le message d'erreur est "Cannot GET /api/v2/not-found"
