#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - ACR

  Plan du Scénario: Authentification avec acr "<acr>" exigé
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "<acr>"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "<acr>"
    Exemples:
      | acr    |
      | eidas1 |
      | eidas2 |
      | eidas3 |

  Scénario: Comportement non spécifié lorsque acr_values et acr exigé demandés simultanément
    # implémentation actuelle : si acr_values est transmis en parallèle d'un claim acr essential,
    # alors les valeurs fournies dans acr_values sont considérées comme « essential » également
    Etant donné je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "eidas3" via acr_values
    Et que le fournisseur de service requiert un niveau de sécurité "eidas2"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    # le niveau eidas3, considéré comme essential, n'est pas satisfait
    # une nouvelle authentification est demandée
    Alors je suis redirigé vers la page interaction

  Plan du Scénario: Erreur d'authentification avec un acr "<acr>" exigé et un acr "<idpAcr>"
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "<acr>"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et le fournisseur d'identité garantit un niveau de sécurité "<idpAcr>"
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur du fournisseur de service
    Et le titre de l'erreur fournisseur de service est "access_denied"
    Et la description de l'erreur fournisseur de service est "None+of+the+requested+ACRs+could+be+obtained."
    Exemples:
      | acr    | idpAcr |
      | eidas1 | eidas2 |
      | eidas2 | eidas1 |

  Plan du Scénario: identification niveau "<acrValues>" utilise "<actualAcr>"
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "<acrValues>" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "<actualAcr>"

    Exemples:
      | acrValues      | actualAcr |
      | eidas1         | eidas1    |
      | inconnu        | eidas1    |
      | eidas2 eidas3  | eidas2    |
      | inconnu eidas3 | eidas3    |

  Scénario: FI retourne le niveau eidas3
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas3"
    Quand je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas3"

  Scénario: FI retourne un niveau inconnu
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "inconnu"
    Quand je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas1"

  Scénario: aucun niveau de sécurité requis
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "acr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas1"
