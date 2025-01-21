#language:fr
Fonctionnalité: Instance - Création avec erreurs
  # En tant que partenaire,
  # je veux être guidé pour corriger mon formulaire de création
  # afin de finaliser la création d'une instance de FS

  @ci
  Scénario: Instance Création - Erreur champ obligatoires
    Etant donné que je me connecte à l'espace partenaires
    Et que je suis sur la page liste des instances
    Et que je clique sur le lien d'ajout d'une instance
    Et que je suis redirigé vers la page création d'instance
    Quand je valide le formulaire de création d'instance
    Alors je suis sur la page création d'instance
    Et les champs suivants ne sont pas en erreur dans le formulaire de création d'instance
      | name        |
      | signup_id   |
      | ipAddresses |
      | entity_id   |
    Et les champs suivants sont en erreur dans le formulaire de création d'instance
      | name                      | errorMessage                                             |
      | instance_name             | Veuillez saisir le nom de votre instance                 |
      | sp_name                   | Veuillez saisir le nom de votre fournisseur de service   |
      | site                      | Veuillez saisir votre url de site                        |
      | redirect_uris             | Veuillez saisir votre url de connexion (url de callback) |
      | post_logout_redirect_uris | Veuillez saisir votre url de déconnexion (url de logout) |
      | signed_response_alg       | Ce champ est obligatoire                                 |
      | use_entity_id             | Ce champ est obligatoire                                 |

  Scénario: Instance Création - Erreur champs trop longs
    Etant donné que je me connecte à l'espace partenaires
    Et que je suis sur la page liste des instances
    Et que je clique sur le lien d'ajout d'une instance
    Et que je suis redirigé vers la page création d'instance
    Quand j'entre les chaines de caractères longues dans les champs suivants du formulaire de création d'instance
      | name                      | totalLength | prefix                         | suffix    |
      | instance_name             | 257         | bdd_                           |           |
      | sp_name                   | 257         | bdd_                           |           |
      | signup_id                 | 8           | 12345678                       |           |
      | site                      | 1025        | https://franceconnect.gouv.fr/ |           |
      | redirect_uris             | 1025        | https://franceconnect.gouv.fr/ | /callback |
      | post_logout_redirect_uris | 1025        | https://franceconnect.gouv.fr/ | /callback |
      | entity_id                 | 65          |                                |           |
    Et je valide le formulaire de création d'instance
    Alors je suis sur la page création d'instance
    Et les champs suivants sont en erreur dans le formulaire de création d'instance
      | name                      | errorMessage                                                               |
      | instance_name             | Le nom de l’instance doit être de 256 caractères maximum                   |
      | sp_name                   | Le nom de votre fournisseur de service doit être de 256 caractères maximum |
      | signup_id                 | Le numéro de la demande datapass doit être de 7 caractères maximum         |
      | site                      | L’url de site doit être de 1024 caractères maximum                         |
      | redirect_uris             | L’url de connexion doit être de 1024 caractères maximum                    |
      | post_logout_redirect_uris | L’url de déconnexion doit être de 1024 caractères maximum                  |
      | entity_id                 | Le client id doit être compris entre 36 et 64 caractères                   |

  @ci
  Scénario: Instance Création - Erreur autres validations
    Etant donné que je me connecte à l'espace partenaires
    Et que je suis sur la page liste des instances
    Et que je clique sur le lien d'ajout d'une instance
    Et que je suis redirigé vers la page création d'instance
    Quand j'entre les valeurs dans les champs suivants du formulaire de création d'instance
      | name                      | value                                 |
      | instance_name             | L'instance ^$1ù*µ-=+#$                |
      | sp_name                   | Le Fournisseur de service ^$^ù*ù$^$^¤ |
      | signup_id                 | abcdefg                               |
      | site                      | franceconnect.gouv.fr                 |
      | redirect_uris             | http://localhost/callback             |
      | post_logout_redirect_uris | ftp://testIsUrl.com                   |
      | ipAddresses               | 1.1.1.1/32                            |
      | signed_response_alg       | HS256                                 |
      | use_entity_id             | non                                   |
      | entity_id                 | _4a858a99-5baf-4068-bd59-ff551ede3619 |
    Et je valide le formulaire de création d'instance
    Alors je suis sur la page création d'instance
    Et les champs suivants ne sont pas en erreur dans le formulaire de création d'instance
      | name          |
      | instance_name |
      | sp_name       |
      | redirect_uris |
      | ipAddresses   |
      | use_entity_id |
    Et les champs suivants sont en erreur dans le formulaire de création d'instance
      | name                      | errorMessage                                                                  |
      | signup_id                 | Veuillez saisir un numéro valide                                              |
      | site                      | Veuillez saisir une url valide                                                |
      | post_logout_redirect_uris | Veuillez saisir une url valide                                                |
      | signed_response_alg       | Les algorithmes de signature autorisés sont les suivants: ES256 et RS256      |
      | entity_id                 | Veuillez saisir le client id de votre fournisseur de service FranceConnect v1 |

  @ci
  Scénario: Instance Création - Défiler vers la première erreur
    Etant donné que je me connecte à l'espace partenaires
    Et que je suis sur la page liste des instances
    Et que je clique sur le lien d'ajout d'une instance
    Et que je suis redirigé vers la page création d'instance
    Et que j'utilise l'instance de FS "avec entity_id"
    Quand j'entre les valeurs par défaut pour mon instance
    Et j'entre les valeurs dans les champs suivants du formulaire de création d'instance
      | name          | value                                 |
      | instance_name |                                       |
      | entity_id     | _4a858a99-5baf-4068-bd59-ff551ede3619 |
    Et je valide le formulaire de création d'instance
    Alors je suis sur la page création d'instance
    Et les champs suivants sont en erreur dans le formulaire de création d'instance
      | name          | errorMessage                                                                  |
      | instance_name | Veuillez saisir le nom de votre instance                                      |
      | entity_id     | Veuillez saisir le client id de votre fournisseur de service FranceConnect v1 |
    Et le champ "instance_name" est visible à l'écran dans le formulaire de création d'instance
    Et le champ "entity_id" n'est pas visible à l'écran dans le formulaire de création d'instance

  @ci
  Scénario: Instance Création - Création après correction
    Etant donné que je me connecte à l'espace partenaires
    Et que je suis sur la page liste des instances
    Et que je clique sur le lien d'ajout d'une instance
    Et que je suis redirigé vers la page création d'instance
    Et que j'utilise l'instance de FS "avec entity_id"
    Et que j'entre les valeurs par défaut pour mon instance
    Et que j'entre "abcdef" dans le champ "signup_id" du formulaire de création d'instance
    Et que je valide le formulaire de création d'instance
    Et que je suis sur la page création d'instance
    Et que l'erreur du champ "signup_id" contient "Veuillez saisir un numéro valide" dans le formulaire de création d'instance
    Quand j'entre "123000" dans le champ "signup_id" du formulaire de création d'instance
    Et je valide le formulaire de création d'instance
    Alors je suis redirigé vers la page liste des instances
    Et la confirmation de création de l'instance est affichée
    Et l'instance créée est affichée
