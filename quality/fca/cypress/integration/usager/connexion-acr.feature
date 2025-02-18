#language: fr
@usager @connexionAcr @ci @ignoreInteg01
Fonctionnalité: Connexion Usager - ACR

  # En tant qu'usager d'un fournisseur de service,
  # je veux me connecter en utilisant un fournisseur d'identité
  # et recevoir sur mon FS un niveau de sécurité eidas1
  Plan du Scénario: Connexion ACR - identification niveau "<acrValues>" utilise eidas1
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert un acr_values à "<acrValues>"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité
    Et je m'authentifie avec succès
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "<actualAcr>"

    Exemples:
      | acrValues      | actualAcr |
      | eidas1         | eidas1    |
      | niveau_inconnu | eidas1    |
      | eidas2 eidas3  | eidas2    |
      | inconnu eidas3 | eidas3    |

  Scénario: Connexion ACR - FI retourne le niveau eidas3
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "eidas3"
    Quand je m'authentifie avec succès
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "eidas3"

  Scénario: Connexion ACR - FI retourne un niveau inconnu
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert un acr_values à "eidas1"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je suis redirigé vers la page login du fournisseur d'identité
    Et que le fournisseur d'identité garantit un niveau de sécurité "inconnu"
    Quand je m'authentifie avec succès
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "eidas1"

  Scénario: Connexion ACR - aucun niveau de sécurité requis
    Etant donné que je navigue sur la page fournisseur de service "par défaut"
    Et que je navigue sur la page fournisseur de service "par défaut"
    Et que le fournisseur de service requiert le claim "acr"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité
    Et je m'authentifie avec succès
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service
    Et la cinématique a utilisé le niveau de sécurité "eidas1"
