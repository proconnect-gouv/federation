#language: fr
@usager @affichageFournisseurIdentité
Fonctionnalité: Affichage Fournisseur Identité

En tant qu'usager d'un fournisseur de service,
je veux visualiser la liste des fournisseurs d'identité disponibles
afin de me connecter au service

@fcpHigh @ignoreInteg01
Scénario: Affichage des FI sur la mire - FI eidas2/eidas3 affichés pour une cinématique FS eidas2
Etant donné que le fournisseur de service requiert un niveau de sécurité "eidas2"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Quand je suis redirigé vers la page sélection du fournisseur d'identité
Alors j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "" et signature "ES256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "ECDH-ES,A256GCM" et signature "ES256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "RSA-OAEP,A256GCM" et signature "RS256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "" et signature "HS256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "RSA-OAEP,A256GCM" et signature "HS256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "RSA-OAEP,A256GCM" et signature "RS256"
Et le fournisseur d'identité est affiché dans la mire

@fcpHigh @ignoreInteg01
Scénario:  Affichage des FI sur la mire - seulement FI eidas3 affichés pour une cinématique FS eidas3
Etant donné que le fournisseur de service requiert un niveau de sécurité "eidas3"
Et que je navigue sur la page fournisseur de service
Et que je clique sur le bouton FranceConnect
Quand je suis redirigé vers la page sélection du fournisseur d'identité
Alors j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "" et signature "ES256"
Et le fournisseur d'identité n'est pas affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "ECDH-ES,A256GCM" et signature "ES256"
Et le fournisseur d'identité n'est pas affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas2" avec chiffrement "RSA-OAEP,A256GCM" et signature "RS256"
Et le fournisseur d'identité n'est pas affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "" et signature "HS256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "RSA-OAEP,A256GCM" et signature "HS256"
Et le fournisseur d'identité est affiché dans la mire
Et j'utilise un fournisseur d'identité supportant "eidas3" avec chiffrement "RSA-OAEP,A256GCM" et signature "RS256"
Et le fournisseur d'identité est affiché dans la mire
