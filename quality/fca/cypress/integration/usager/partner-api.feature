#language: fr
@ignoreInteg01
Fonctionnalité: Test de l'aoi de l'espace partenaires

  Scénario: Une requête api est envoyée avec une mauvaise signature
    Etant donné que j'envoie une requête pour créer un FS avec une signature invalide
# Quand je reçois un code de réponse 401
# Alors je peux vérifier que le message d'erreur est "Signature invalide"

# Scénario: Une requête api est envoyée sans signature
#   Etant donné que j'envoie une requête pour créer un FS avec sans signature
#   Quand je reçois un code de réponse 401
#   Alors je peux vérifier que le message d'erreur est "Signature invalide"

# Scénario: Un FS est crée via l'api
#   Etant donné que j'envoie une requête pour créer un FS
#   Et que je reçois un code de réponse 200
#   Quand je vérifie que le FS est bien présent dans FC Exploit
#   Alors je peux accéder à la page de ce FS
