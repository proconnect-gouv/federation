#language: fr
@usager @connexionUsager
Fonctionnalité: Connexion Usager
En tant qu'usager d'un fournisseur de service,
je veux me connecter en utilisant un fournisseur d'identité
afin d'accéder à mon service

@fcpLow
Scénario: Connexion d'un usager - identification niveau faible
Etant donné que le fournisseur de service requiert l'accès aux informations du scope "identite_pivot"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Et que je suis redirigé vers la page sélection du fournisseur d'identité
Et que j'utilise un fournisseur d'identité avec niveau de sécurité "eidas1"
Et que je clique sur le fournisseur d'identité
Et que je suis redirigé vers la page login du fournisseur d'identité
Quand je m'authentifie avec succès
Et je suis redirigé vers la page confirmation de connexion
Et les informations demandées par le fournisseur de service correspondent au scope "identite_pivot"
Et j'accepte de transmettre mes informations au fournisseur de service
Alors je suis redirigé vers la page fournisseur de service
Et je suis connecté
Et le fournisseur de service a accès aux informations du scope "identite_pivot"

@fcpHigh
Scénario: Connexion d'un usager - identification niveau élevé
Etant donné que le fournisseur de service requiert l'accès aux informations du scope "identite_pivot"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Et que je suis redirigé vers la page sélection du fournisseur d'identité
Et que j'utilise un fournisseur d'identité avec niveau de sécurité "eidas3"
Et que je clique sur le fournisseur d'identité
Et que je suis redirigé vers la page login du fournisseur d'identité
Quand je m'authentifie avec succès
Et je suis redirigé vers la page confirmation de connexion
Et les informations demandées par le fournisseur de service correspondent au scope "identite_pivot"
Et j'accepte de transmettre mes informations au fournisseur de service
Alors je suis redirigé vers la page fournisseur de service
Et je suis connecté
Et le fournisseur de service a accès aux informations du scope "identite_pivot"

Scénario: Connexion d'un usager - avec AMR fc
Etant donné que le fournisseur de service requiert le claim "amr"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Et que je suis redirigé vers la page sélection du fournisseur d'identité
Et que je clique sur le fournisseur d'identité
Et que je suis redirigé vers la page login du fournisseur d'identité
Quand je m'authentifie avec succès
Et je suis redirigé vers la page confirmation de connexion
Et j'accepte de transmettre mes informations au fournisseur de service
Alors je suis redirigé vers la page fournisseur de service
Et je suis connecté
Et la cinématique a renvoyé l'amr "fc"

Scénario: Connexion d'un usager - AMR absent si non demandé
Etant donné que le fournisseur de service ne requiert pas le claim "amr"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Et que je suis redirigé vers la page sélection du fournisseur d'identité
Et que je clique sur le fournisseur d'identité
Et que je suis redirigé vers la page login du fournisseur d'identité
Quand je m'authentifie avec succès
Et je suis redirigé vers la page confirmation de connexion
Et j'accepte de transmettre mes informations au fournisseur de service
Alors je suis redirigé vers la page fournisseur de service
Et je suis connecté
Et la cinématique n'a pas renvoyé d'amr
