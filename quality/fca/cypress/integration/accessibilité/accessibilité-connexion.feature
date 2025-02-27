#language: fr
Fonctionnalité: Accessibilité

  Plan du Scénario: Accessibilité - page sélection FI sur <device>
    Etant donné que j'utilise un navigateur web sur "<device>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Quand je vérifie l'accessibilité sur cette page
    Alors aucune erreur d'accessibilité n'est présente

    Exemples:
      | device           |
      | mobile           |
      | tablet portrait  |
      | tablet landscape |
      | desktop          |

  @exceptions
  Plan du Scénario: Accessibilité - page erreur usagé sans email renvoyé par le FI sur <device>
    Etant donné que j'utilise un navigateur web sur "<device>"
    Et que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et j'utilise un compte usager sans email
    Et je m'authentifie
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "Y500006"
    Quand je vérifie l'accessibilité sur cette page
    Alors aucune erreur d'accessibilité n'est présente

    Exemples:
      | device           |
      | mobile           |
      | tablet portrait  |
      | tablet landscape |
      | desktop          |
