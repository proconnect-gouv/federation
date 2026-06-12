#language: fr
@ignoreInteg01 @k8s
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
    Et la description de l'erreur fournisseur de service est "requested%20ACRs%20could%20not%20be%20satisfied"
    Exemples:
      | acr    | idpAcr |
      | eidas1 | eidas2 |
      | eidas2 | eidas1 |

  Plan du Scénario: identification niveau "<acrValues>" utilise "<actualAcr>"
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "<acrValues>"
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
    Et que le fournisseur de service requiert un niveau de sécurité "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas3"
    Quand je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas3"

  Scénario: FI retourne un niveau inconnu
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert un niveau de sécurité "eidas1"
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
