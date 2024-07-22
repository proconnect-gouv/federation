#language: fr
@usager @connexionAcr @fcpHigh
Fonctionnalité: Connexion ACR
  # En tant qu'usager d'un fournisseur de service,
  # je veux utiliser un niveau de sécurité spécifique lors de ma connexion
  # afin d'accéder à mon service

  Plan du Scénario: Connexion ACR - FCP high - identification niveau "<acrValues>" (méthode <method>)
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "<acrValues>"
    Et que le fournisseur de service se connecte à FranceConnect via la méthode "<method>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité "actif"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Quand je m'authentifie avec succès
    Et je suis redirigé vers la page confirmation de connexion
    Et les informations demandées par le fournisseur de service correspondent au scope "tous les scopes"
    Et je continue sur le fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "<actualAcr>"
    Et le fournisseur de service a accès aux informations du scope "tous les scopes"

    @ci
    Exemples:
      | acrValues      | method | actualAcr |
      | eidas2         | get    | eidas2    |
      | eidas3         | post   | eidas3    |
      | niveau_inconnu | post   | eidas3    |

    Exemples:
      | acrValues             | method | actualAcr |
      | eidas2                | post   | eidas2    |
      | eidas3                | get    | eidas3    |
      | eidas2 niveau_inconnu | get    | eidas2    |
      | eidas3 eidas2         | post   | eidas2    |
      | eidas2 eidas3         | get    | eidas2    |

  Plan du Scénario: Connexion ACR - FCP high - identification niveau non autorisé "<acrValues>" (méthode <method>)
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "<acrValues>"
    Et que le fournisseur de service se connecte à FranceConnect via la méthode "<method>"
    Et que je navigue sur la page fournisseur de service
    Quand je clique sur le bouton FranceConnect
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "invalid_acr"
    Et la description de l'erreur fournisseur de service est "acr_value is not valid, should be equal one of these values, expected eidas2,eidas3, got <actualAcr>"

    Exemples:
      | acrValues            | method | actualAcr |
      | eidas1               | get    | eidas1    |
      | eidas1               | post   | eidas1    |
      | eidas1 inconnu       | get    | eidas1    |
      | inconnu eidas1       | post   | eidas1    |
      | eidas1 eidas2 eidas3 | post   | eidas1    |

  @ci
  Plan du Scénario: Connexion ACR - FCP high - cinématique "<spAcr>" avec FI retournant niveau "<idpAcr>"
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "<spAcr>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité avec niveau de sécurité "eidas3"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "<idpAcr>"
    Quand je m'authentifie avec succès
    Et je suis redirigé vers la page confirmation de connexion
    Et les informations demandées par le fournisseur de service correspondent au scope "tous les scopes"
    Et je continue sur le fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "<actualAcr>"
    Et le fournisseur de service a accès aux informations du scope "tous les scopes"

    Exemples:
      | spAcr  | idpAcr | actualAcr |
      | eidas2 | eidas2 | eidas2    |
      | eidas2 | eidas3 | eidas3    |
      | eidas3 | eidas3 | eidas3    |

  Plan du Scénario: Connexion ACR - FCP high - erreur FI retourne un niveau <idpAcr> inférieur à <spAcr>
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "<spAcr>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité avec niveau de sécurité "eidas3"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "<idpAcr>"
    Quand je m'authentifie avec succès
    Alors je suis redirigé vers la page erreur technique FranceConnect
    Et le code d'erreur FranceConnect est "Y020001"
    Et le message d'erreur FranceConnect est "Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter."

    Exemples:
      | spAcr  | idpAcr  |
      | eidas2 | eidas1  |
      | eidas3 | eidas1  |
      | eidas3 | eidas2  |
      | eidas2 | inconnu |


  # Waiting for an "eidas2" IdP to be available on Integ01
  @ignoreInteg01
  Scénario: Connexion ACR - FCP high - erreur FI retourne un acr qui ne lui est pas permis (supérieur)
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "eidas2"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise un fournisseur d'identité avec niveau de sécurité "eidas2"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas3"
    Quand je m'authentifie avec succès
    Alors je suis redirigé vers la page erreur technique FranceConnect
    Et le code d'erreur FranceConnect est "Y020018"
    Et le message d'erreur FranceConnect est "Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter."

  Scénario: Connexion ACR - FCP high - erreur FI retourne un acr qui ne lui est pas permis (inférieur)
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "eidas2"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise le fournisseur d'identité "eidas3 seulement"
    Et que je clique sur le fournisseur d'identité
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas2"
    Quand je m'authentifie avec succès
    Alors je suis redirigé vers la page erreur technique FranceConnect
    Et le code d'erreur FranceConnect est "Y020018"
    Et le message d'erreur FranceConnect est "Une erreur technique est survenue. Si le problème persiste, veuillez nous contacter."


  # @Todo: check if we can use FIN as an "eidas3 only" provider on Integ01
  @ignoreInteg01
  Scénario: Connexion ACR - FCP high - FC demande au FI un acr supérieur à celui demandé par le FS car le FI ne supporte pas moins
    Etant donné que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que le fournisseur de service requiert un niveau de sécurité "eidas2"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton FranceConnect
    Et que je suis redirigé vers la page sélection du fournisseur d'identité
    Et que j'utilise le fournisseur d'identité "eidas3 seulement"
    Et que je clique sur le fournisseur d'identité
    Quand je suis redirigé vers la page login du fournisseur d'identité
    Alors Le fournisseur d'identité a été appelé avec le niveau de sécurité "eidas3"
    Et je m'authentifie avec succès
    Et je suis redirigé vers la page confirmation de connexion
    Et je continue sur le fournisseur de service
    Alors je suis redirigé vers la page fournisseur de service
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "eidas3"