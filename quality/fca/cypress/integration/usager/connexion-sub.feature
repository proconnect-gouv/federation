#language: fr
Fonctionnalité: Connexion Usager - Sub

  Scénario: Connexion Usager - deux FS avec accès au même FI génèrent le même sub
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

  Scénario: Connexion Usager - deux FS avec accès à deux FI génèrent deux subs
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
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "second fs"
    Et que je suis connecté au fournisseur de service
    Alors le sub transmis au fournisseur de service est différent du sub mémorisé

  Scénario: Connexion Usager - un FS avec accès à deux FI génèrent deux subs
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
    Et que j'entre l'email "test@fia2.fr"
    Et que je clique sur le bouton de connexion
    Et que je m'authentifie
    Et que je suis redirigé vers la page fournisseur de service "premier FS"
    Et que je suis connecté au fournisseur de service
    Alors le sub transmis au fournisseur de service est différent du sub mémorisé

  Scénario: Connexion Usager - un FS avec accès au même FI génèrent un sub
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
  Scénario: Connexion Usager - connexion via un user qui a déjà un account avec un sub
    Etant donné que je navigue sur la page fournisseur de service "premier FS"
    Et que je clique sur le bouton ProConnect
    Et que je suis redirigé vers la page interaction
    Et que j'entre l'email "test@fia1.fr"
    Et que je clique sur le bouton de connexion
    Quand j'utilise le compte usager avec le sub "e3322382e75c0d0a8e95f80af703932bd3c38f940aa59ad08b1cb4900998578c"
    Et que je m'authentifie
    Alors le sub transmis au fournisseur de service est le suivant "d68cec59-ed65-48ab-bfbf-1ca65dd807f8"
