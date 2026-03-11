#language: fr
@ignoreInteg01
Fonctionnalité: Réconciliation d'identité d'un usager PCI dont le domaine est préempté
  Plan du Scénario: Chapitre 1: création d'un compte ProConnect Identité (ex MonComptePro)
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus@example.com"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "moncomptepro"
    Et j'utilise l'identité avec le sub "2balbus4ever"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service
    Et je mémorise le sub envoyé au fournisseur de service
    Et je clique sur le bouton de déconnexion

    # Chapitre 2: modification d'un FI qui masque le domaine de l'usager PCI
    Etant donné que je navigue sur la page login d'exploitation
    Et que je me connecte à exploitation en tant que "exploitant"
    Et que je navigue vers la page gestion des fournisseurs d'identité
    Et que je clique sur le bouton de modification du FI "<idpName>"
    Et que j'ajoute la valeur "example.com" au champ "fqdns" du formulaire de modification de FI
    Quand je valide le formulaire de modification de FI
    Alors le message de confirmation de modification du FI "<idpName>" est affiché

    # Chapitre 3: connexion avec le nouveau FI, mais sub identique
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "albus@example.com"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "second FI"
    Et j'utilise l'identité avec le sub "1more4albus"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service
    Et le sub transmis au fournisseur de service est identique au sub mémorisé

    Exemples:
      | idpName  |
      | fia2-low |

    @k8s @ignoreInteg01 @ignoreDocker
    Exemples:
      | idpName                  |
      | Fournisseur d'identité 2 |

  Plan du Scénario: Epilogue - nettoyage
    Etant donné que je navigue sur la page login d'exploitation
    Et que je me connecte à exploitation en tant que "exploitant"
    Et que je navigue vers la page gestion des fournisseurs d'identité
    Et que je clique sur le bouton de modification du FI "<idpName>"
    Et que je retire la valeur "example.com" du champ "fqdns" du formulaire de modification de FI
    Quand je valide le formulaire de modification de FI
    Alors le message de confirmation de modification du FI "<idpName>" est affiché

    Exemples:
      | idpName  |
      | fia2-low |

    @k8s @ignoreInteg01 @ignoreDocker
    Exemples:
      | idpName                  |
      | Fournisseur d'identité 2 |

  @k8s
  Scénario: La réconciliation ignore la casse de l'adresse email
    Etant donné que je navigue sur la page fournisseur de service
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "minerva@example.com"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "moncomptepro"
    Et j'utilise l'identité avec le sub "minerva-mcp-sub"
    Et je m'authentifie
    Et je mémorise le sub envoyé au fournisseur de service
    Et je clique sur le bouton de déconnexion

    Etant donné que je clique sur le bouton ProConnect
    Et que j'entre l'email "minerva@fia1.fr"
    Quand je clique sur le bouton de connexion
    Et je suis redirigé vers la page login du fournisseur d'identité "premier FI"
    Et j'utilise le compte usager avec l'email "MINERVA@example.com"
    Et j'utilise l'identité avec le sub "minerva-fia1-sub"
    Et je m'authentifie
    Alors je suis connecté au fournisseur de service
    Et le sub transmis au fournisseur de service est identique au sub mémorisé
