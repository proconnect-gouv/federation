#language: fr
@userDashboard @fraudUserDashboard
Fonctionnalité: Connexion Formulaire Usurpation
  # En tant qu'usager de FranceConnect,
  # je veux me connecter au formulaire usurpation
  # afin de signaler un cas d'usurpation d'identité

  Scénario: Formulaire Usurpation - Connexion
    Etant donné que je navigue sur la page de connexion du formulaire usurpation
    Quand je me connecte pour accéder au formulaire usurpation
    Alors je suis redirigé vers le formulaire usurpation
    Et le lien de déconnexion du tableau de bord usager est affiché
    Et je me déconnecte du tableau de bord usager

  Scénario: Formulaire Usurpation - Connexion avec fraudSurveyOrigin
    Etant donné que je navigue directement vers le formulaire usurpation avec fraudSurveyOrigin égal à "identite-inconnue"
    Et que je suis redirigé vers la page de connexion du formulaire usurpation
    Quand je me connecte pour accéder au formulaire usurpation
    Alors je suis redirigé vers le formulaire usurpation avec fraudSurveyOrigin égal à "identite-inconnue"
    Et le lien de déconnexion du tableau de bord usager est affiché
    Et je me déconnecte du tableau de bord usager

  Scénario: Formulaire Usurpation - Présence du lien vers le Formulaire Usager sur la page de connexion
    Etant donné que je navigue directement vers le formulaire usurpation avec fraudSurveyOrigin égal à "identite-inconnue"
    Quand je suis redirigé vers la page de connexion du formulaire usurpation
    Alors le lien vers l'application Formulaire Usager est affiché sur la page de connexion du formulaire usurpation
    Et le lien vers l'application Formulaire Usager comporte la valeur "identite-inconnue" pour le paramètre fraudSurveyOrigin

  Scénario: Formulaire Usurpation - Déconnexion
    Etant donné que je navigue sur la page de connexion du formulaire usurpation
    Et que je me connecte pour accéder au formulaire usurpation
    Et que je suis redirigé vers le formulaire usurpation
    Quand je me déconnecte du tableau de bord usager
    Alors je suis redirigé vers la page de connexion du formulaire usurpation
    Et le message d'alerte "session expirée" n'est pas affiché sur la page de connexion du formulaire usurpation
    Et je ne suis plus connecté au tableau de bord usager avec FranceConnect

  Scénario: Formulaire Usurpation - Chargement du formulaire usurpation après déconnexion
    Etant donné que j'utilise un compte usager "par défaut"
    Et que je navigue sur la page de connexion du formulaire usurpation
    Et que je me connecte pour accéder au formulaire usurpation
    Et que je suis redirigé vers le formulaire usurpation
    Et que je me déconnecte du tableau de bord usager
    Et que je suis redirigé vers la page de connexion du formulaire usurpation
    Quand je navigue directement vers le formulaire usurpation
    Alors je suis redirigé vers la page de connexion du formulaire usurpation
    Et le message d'alerte "session expirée" n'est pas affiché sur la page de connexion du formulaire usurpation
    Et je ne suis plus connecté au tableau de bord usager avec FranceConnect
