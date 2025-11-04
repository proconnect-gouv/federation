#language: fr
@ignoreInteg01
Fonctionnalité: Erreur redirect uri invalide

  Plan du Scénario: Erreur <error> redirect_uri=<redirectUri>
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service envoie la redirect_uri "<redirectUri>"
    Et que je clique sur le bouton ProConnect
    Alors je suis redirigé vers la page erreur technique
    Et le code d'erreur est "<error>"
    Et le message d'erreur est "<errorDescription>"
    Et le lien retour vers le FS n'est pas affiché dans la page erreur technique

    Exemples:
      | redirectUri                          | error                                             | errorDescription                                                        |
      |                                      | Y000400                                           | redirect_uri must match /^https?:\/\/[^/].+$/ regular expression        |
      | example.com                          | Y000400                                           | redirect_uri must match /^https?:\/\/[^/].+$/ regular expression        |
      | https://my-malicious-url.fr/callback | oidc-provider-rendered-error:invalid_redirect_uri | redirect_uri did not match any of the client's registered redirect_uris |
