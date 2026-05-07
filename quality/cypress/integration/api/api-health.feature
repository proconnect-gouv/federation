#language: fr

Fonctionnalité: API - health

  Scénario: livez - répond ok
    Etant donné que je prépare une requête "livez"
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et le corps de la réponse est "ok"

  @hybridge
  Scénario: readyz - répond ok quand tous les services sont disponibles
    Etant donné que je prépare une requête "readyz"
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et le corps de la réponse est "ok"

  @hybridge
  Scénario: readyz verbose - détaille l'état de chaque service
    Etant donné que je prépare une requête "readyz-verbose"
    Quand je lance la requête
    Alors le statut de la réponse est 200
    Et le corps de la réponse contient "[+]mongodb ok"
    Et le corps de la réponse contient "[+]redis ok"
    Et le corps de la réponse contient "[+]api-entreprise ok"
    Et le corps de la réponse contient "[+]hyyyperbridge ok"
    Et le corps de la réponse contient "readyz check passed"
