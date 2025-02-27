#language: fr
@ignoreInteg01
Fonctionnalité: Connexion Usager - ACR
  Plan du Scénario: Connexion ACR - identification niveau "<acrValues>" utilise eidas1
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
      | niveau_inconnu | eidas1    |
      | eidas2 eidas3  | eidas2    |
      | inconnu eidas3 | eidas3    |

  Scénario: Connexion ACR - FI retourne le niveau eidas3
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas3"
    Quand je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas3"

  Scénario: Connexion ACR - FI retourne un niveau inconnu
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service demande un niveau de sécurité "eidas1" via acr_values
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que le fournisseur d'identité garantit un niveau de sécurité "inconnu"
    Quand je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas1"

  Scénario: Connexion ACR - aucun niveau de sécurité requis
    Etant donné que je navigue sur la page fournisseur de service
    Et que le fournisseur de service requiert le claim "acr"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je m'authentifie
    Alors la cinématique a utilisé le niveau de sécurité "eidas1"
