#language: fr
@validationVisuelle
Fonctionnalité: Validation Visuelle

  Plan du Scénario: Validation Visuelle - cinématique d'un agent sur <device>
    Etant donné que j'utilise un navigateur web sur "<device>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que la copie d'écran "selectionFI" correspond à la page actuelle sur "<device>"
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand je m'authentifie
    Alors je suis redirigé vers la page fournisseur de service "par défaut"
    Et je suis connecté au fournisseur de service

    Exemples:
      | device           |
      | mobile           |
      | tablet portrait  |
      | tablet landscape |
      | desktop          |

  Plan du Scénario: Validation Visuelle - erreur ACR inconnu envoyé par le FI sur <device>
    Etant donné que j'utilise un navigateur web sur "<device>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise un compte usager sans email
    Et je m'authentifie
    Alors je suis redirigé vers la page erreur technique
    Et la copie d'écran "erreur" sans "[data-testid=\"error-id\"]" correspond à la page actuelle sur "<device>"
    Et le code d'erreur est "Y500006"

    Exemples:
      | device           |
      | mobile           |
      | tablet portrait  |
      | tablet landscape |
      | desktop          |
