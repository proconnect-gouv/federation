#language: fr
Fonctionnalité: Connexion Usager - Sub
  Scénario: retourne le même sub à deux FS différents quand j'utilise la même identité
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je mémorise le sub envoyé au fournisseur de service
    Et que je me déconnecte du fournisseur de service
    Quand je navigue sur la page fournisseur de service "second fs"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "second fs"
    Et que je suis connecté au fournisseur de service
    Alors le sub transmis au fournisseur de service est identique au sub mémorisé

  Scénario: retourne le même sub pour une reconnexion sur un même FS avec la même identité
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Et que je mémorise le sub envoyé au fournisseur de service
    Et que je me déconnecte du fournisseur de service
    Quand je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Alors le sub transmis au fournisseur de service est identique au sub mémorisé

  @ignoreInteg01
  Scénario: retourne le sub déjà enregistré pour deux identités connues qui sont rattachées à un même sub dans ProConnect
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise l'identité avec le sub "e3322382e75c0d0a8e95f80af703932bd3c38f940aa59ad08b1cb4900998578c"
    Et que je m'authentifie
    Alors le sub transmis au fournisseur de service est le suivant "d68cec59-ed65-48ab-bfbf-1ca65dd807f8"
    Et que je mémorise le sub envoyé au fournisseur de service
    Et que je me déconnecte du fournisseur de service
    Quand je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise l'identité avec le sub "s7Ht2K9pL5mN8vX3cR4wQ"
    Et que je m'authentifie
    Alors le sub transmis au fournisseur de service est le suivant "d68cec59-ed65-48ab-bfbf-1ca65dd807f8"
    Alors le sub transmis au fournisseur de service est identique au sub mémorisé
