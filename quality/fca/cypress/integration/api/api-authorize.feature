#language: fr
Fonctionnalité: API - authorize
  Plan du Scénario: API authorize - erreur InvalidClient client_id=<clientId>
    Etant donné que je prépare une requête "authorize"
    Et que je mets "<clientId>" dans le paramètre "client_id" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 400
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page erreur technique
    Et le code d'erreur est "invalid_client"
    Et le message d'erreur est "client is invalid"
    Et le lien retour vers le FS n'est pas affiché dans la page erreur technique

    Exemples:
      | clientId                        |
      | inconnu                         |
      | my-service-provider-deactivated |

  @ignoreDocker
  Scénario: API authorize - localhost autorisé en integ
    Etant donné que je prépare une requête "authorize"
    Et que je mets "214f336f-fa6d-463a-818b-c80a3e74cd1c" dans le paramètre "client_id" de la requête
    Et que je mets "http://localhost:3000/login-callback" dans le paramètre "redirect_uri" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page interaction

  Plan du Scénario: API authorize - Cas nominal prompt=<prompt>
    Etant donné que je prépare une requête "authorize"
    Et que je mets "<prompt>" dans le paramètre "prompt" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page interaction

    Exemples:
      | prompt        |
      | login         |
      | consent       |
      | login consent |
      | consent login |

  Scénario: API authorize - prompt n'est pas défini
    Etant donné que je prépare une requête "authorize"
    Et que je retire le paramètre "prompt" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page interaction

  Plan du Scénario: API authorize - erreur prompt=none sans session
    Etant donné que je prépare une requête "authorize"
    Et que je mets "<prompt>" dans le paramètre "prompt" de la requête
    Et que je configure la requête pour ne pas suivre les redirections
    Quand je lance la requête
    Alors le statut de la réponse est 303
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec une erreur
    Et l'url de callback du FS a un paramètre "error" égal à "<error>"
    Et l'url de callback du FS a un paramètre "error_description" égal à "<errorDescription>"

    Exemples:
      | prompt       | error           | errorDescription                    |
      | none         | login_required  | End-User authentication is required |
      | none login   | invalid_request | prompt none must only be used alone |
      | none consent | invalid_request | prompt none must only be used alone |

  Scénario: API authorize - Cas nominal sans nonce
    Etant donné que je prépare une requête "authorize"
    Et je retire le paramètre "nonce" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page interaction

Scénario: API authorize - Cas nominal avec response_mode (ignoré)
    Etant donné que je prépare une requête "authorize"
    Et que je mets "fragment" dans le paramètre "response_mode" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et le corps de la réponse contient une page web
    Et je suis redirigé vers la page interaction

  Scénario: API authorize - Erreur <error> avec code_challenge=<codeChallenge>
    Etant donné que je prépare une requête "authorize"
    Et que je configure la requête pour ne pas suivre les redirections
    Et que je mets "<codeChallenge>" dans le paramètre "code_challenge" de la requête
    Et que je mets "S256" dans le paramètre "code_challenge_method" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 303
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec l'erreur
    Et l'url de callback du FS a un paramètre "error" égal à "<error>"
    Et l'url de callback du FS a un paramètre "error_description" égal à "<errorDescription>"

    Exemples:
      | codeChallenge                                    | error            | errorDescription                                                       |
      |                                                  | invalid_request  | code_challenge must be provided with code_challenge_method             |
      | Petit code challenge                             | invalid_request  | code_challenge must be a string with a minimum length of 43 characters |
      | Code challenge accentué d'au moins 43 caractères | invalid_request  | code_challenge contains invalid characters                             |

  Scénario: API authorize - Erreur <error> avec code_challenge_method=<codeChallengeMethod>
    Etant donné que je prépare une requête "authorize"
    Et que je configure la requête pour ne pas suivre les redirections
    Et que je mets "test_challenge_qui_fait_au_moins_43_caracteres" dans le paramètre "code_challenge" de la requête
    Et que je mets "<codeChallengeMethod>" dans le paramètre "code_challenge_method" de la requête
    Quand je lance la requête
    Alors le statut de la réponse est 303
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec l'erreur
    Et l'url de callback du FS a un paramètre "error" égal à "<error>"
    Et l'url de callback du FS a un paramètre "error_description" égal à "<errorDescription>"

    Exemples:
      | codeChallengeMethod | error            | errorDescription                                                                      |
      |                     | invalid_request  | plain code_challenge_method fallback disabled, code_challenge_method must be provided |
      | plain               | invalid_request  | not supported value of code_challenge_method                                          |

  Plan du Scénario: API authorize - Erreur <error> avec response_type=<responseType>
    Etant donné que je prépare une requête "authorize"
    Et que je mets "<responseType>" dans le paramètre "response_type" de la requête
    Et que je configure la requête pour ne pas suivre les redirections
    Quand je lance la requête
    Alors le statut de la réponse est 303
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec l'erreur
    Et l'url de callback du FS a un paramètre "error" égal à "<error>"
    Et l'url de callback du FS a un paramètre "error_description" égal à "<errorDescription>"

    Exemples:
      | responseType | error                     | errorDescription                    |
      |              | invalid_request           | missing required parameter          |
      | inconnu      | unsupported_response_type | unsupported response_type requested |

  # D'après la spécification si response_type contient token ou id_token,
  # le FI doit renvoyer un fragment dans le cas passant ou lors d'une erreur
  # https://openid.net/specs/oauth-v2-multiple-response-types-1_0-09.html#rfc.section.5
  Plan du Scénario: API authorize - Erreur unsupported_response_type avec response_type=<responseType> avec redirection contenant un fragment
    Etant donné que je prépare une requête "authorize"
    Et que je mets "<responseType>" dans le paramètre "response_type" de la requête
    Et que je configure la requête pour ne pas suivre les redirections
    Quand je lance la requête
    Alors le statut de la réponse est 303
    Et l'entête de la réponse a une propriété "content-type" contenant "text/html"
    Et l'entête de la réponse a une propriété "location" contenant l'url de callback du FS avec l'erreur (fragment)
    Et l'url de callback du FS a un paramètre "error" égal à "unsupported_response_type"
    Et l'url de callback du FS a un paramètre "error_description" égal à "unsupported response_type requested"

    Exemples:
      | responseType   |
      | id_token       |
      | id_token token |
      | code id_token  |
      | code token     |
      | code token     |
