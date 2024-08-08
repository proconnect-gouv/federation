#language: fr
@userDashboard @historiqueConnexion @ignoreInteg01
Fonctionnalité: Historique Connexion sur FranceConnect(v2) (docker)
  # En tant qu'usager de FranceConnect,
  # je veux me connecter au user-dashboard
  # afin de consulter mon historique de connexion FC v2

  Scénario: Historique Connexion - FranceConnect(v2) - Supprimer les traces dans ElasticSearch
    Etant donné que les traces sont supprimées dans elasticsearch

  Scénario: Historique Connexion - FranceConnect(v2) - FS public avec scope identité
    Etant donné que j'utilise un compte usager "pour les tests de traces"
    Et que le fournisseur de service requiert l'accès aux informations du scope "tous les scopes"
    Et que j'utilise le fournisseur de service "par défaut"
    Et que j'ai fait une cinématique FranceConnect avec appel aux FD
    Et que les traces "FranceConnect(v2)" sont récupérées dans elasticsearch
    Et que je navigue sur la page d'accueil du tableau de bord usager
    Quand je me connecte au tableau de bord usager
    Alors je suis redirigé vers la page historique du tableau de bord usager
    Et 1 évènement "FranceConnect" est affiché
    Et j'affiche le détail du dernier évènement "Connexion" sur "FranceConnect" du fournisseur de service "fsp1-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Connexion"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp1-low"
    Et la date et heure de connexion correspondent à maintenant
    Et la localisation de l'évènement n'est pas affichée
    Et le nom du fournisseur d'identité de l'évènement est "FIP1-LOW - eIDAS LOW - NO DISCOVERY"
    Et le niveau de sécurité de l'évènement est "Faible"

  Scénario: Historique Connexion - FranceConnect(v2) - FS public avec scope data
    Etant donné que j'utilise un compte usager "pour les tests de traces"
    Et que j'utilise le fournisseur de service "par défaut"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "dgfip et cnam"
    Et que j'ai fait une cinématique FranceConnect avec appel aux FD
    Et que les traces "FranceConnect(v2)" sont récupérées dans elasticsearch
    Et que je navigue sur la page d'accueil du tableau de bord usager
    Quand je me connecte au tableau de bord usager
    Alors je suis redirigé vers la page historique du tableau de bord usager
    Et 3 évènements "FranceConnect" sont affichés
    Et j'affiche le détail du dernier évènement "Connexion" sur "FranceConnect" du fournisseur de service "fsp1-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Connexion"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp1-low"
    Et la date et heure de connexion correspondent à maintenant
    Et la localisation de l'évènement n'est pas affichée
    Et le nom du fournisseur d'identité de l'évènement est "FIP1-LOW - eIDAS LOW - NO DISCOVERY"
    Et le niveau de sécurité de l'évènement est "Faible"
    Et j'affiche le détail du 1er évènement "Échange de Données" sur "FranceConnect" du FS "fsp1-low" avec le FD "DGFIP"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Échange de Données"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp1-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne aucune donnée "FCP_LOW"
    Et l'évènement concerne aucune donnée "CNAM"
    Et l'évènement concerne 5 données "DGFIP"
    Et les données "DGFIP" de l'évènement contiennent "Revenu fiscal de référence"
    Et les données "DGFIP" de l'évènement contiennent "Nombre de parts du foyer fiscal"
    Et les données "DGFIP" de l'évènement contiennent "Situation de famille (marié, pacsé, célibataire, veuf, divorcé)"
    Et les données "DGFIP" de l'évènement contiennent "Détail des personnes à charge et rattachées"
    Et les données "DGFIP" de l'évènement contiennent "Adresse déclarée au 1er Janvier"
    Et j'affiche le détail du 1er évènement "Échange de Données" sur "FranceConnect" du FS "fsp1-low" avec le FD "CNAM"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Échange de Données"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp1-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne aucune donnée "FCP_LOW"
    Et l'évènement concerne aucune donnée "DGFIP"
    Et l'évènement concerne 1 donnée "CNAM"
    Et les données "CNAM" de l'évènement contiennent "Paiements d’indemnités journalières versées par l’Assurance Maladie"

  Scénario: Historique Connexion - FranceConnect(v2) - FS privé avec scope identité
    Etant donné que j'utilise un compte usager "pour les tests de traces"
    Et que j'utilise le fournisseur de service "privé avec consentement obligatoire"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "tous les scopes"
    Et que j'ai fait une cinématique FranceConnect avec appel aux FD
    Et que les traces "FranceConnect(v2)" sont récupérées dans elasticsearch
    Et que je navigue sur la page d'accueil du tableau de bord usager
    Quand je me connecte au tableau de bord usager
    Alors je suis redirigé vers la page historique du tableau de bord usager
    Et 2 évènements "FranceConnect" sont affichés
    Et j'affiche le détail du dernier évènement "Connexion" sur "FranceConnect" du fournisseur de service "fsp3-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Connexion"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de connexion correspondent à maintenant
    Et la localisation de l'évènement n'est pas affichée
    Et le nom du fournisseur d'identité de l'évènement est "FIP1-LOW - eIDAS LOW - NO DISCOVERY"
    Et le niveau de sécurité de l'évènement est "Faible"
    Et j'affiche le détail du dernier évènement "Autorisation" sur "FranceConnect" du fournisseur de service "fsp3-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Autorisation"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne 8 données "FCP_LOW"
    Et les données "FCP_LOW" de l'évènement contiennent "Prénom(s)"
    Et les données "FCP_LOW" de l'évènement contiennent "Nom de naissance"
    Et les données "FCP_LOW" de l'évènement contiennent "Date de naissance"
    Et les données "FCP_LOW" de l'évènement contiennent "Sexe"
    Et les données "FCP_LOW" de l'évènement contiennent "Nom d’usage"
    Et les données "FCP_LOW" de l'évènement contiennent "Pays de naissance"
    Et les données "FCP_LOW" de l'évènement contiennent "Lieu de naissance"
    Et les données "FCP_LOW" de l'évènement contiennent "Adresse email"
    Et l'évènement concerne aucune donnée "DGFIP"
    Et l'évènement concerne aucune donnée "CNAM"

  Scénario: Historique Connexion - FranceConnect(v2) - FS privé avec scope data
    Etant donné que j'utilise un compte usager "pour les tests de traces"
    Et que j'utilise le fournisseur de service "privé avec consentement obligatoire"
    Et que le fournisseur de service requiert l'accès aux informations des scopes "dgfip et cnam"
    Et que j'ai fait une cinématique FranceConnect avec appel aux FD
    Et que les traces "FranceConnect(v2)" sont récupérées dans elasticsearch
    Et que je navigue sur la page d'accueil du tableau de bord usager
    Quand je me connecte au tableau de bord usager
    Alors je suis redirigé vers la page historique du tableau de bord usager
    Et 4 évènements "FranceConnect" sont affichés
    Et j'affiche le détail du dernier évènement "Connexion" sur "FranceConnect" du fournisseur de service "fsp3-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Connexion"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de connexion correspondent à maintenant
    Et la localisation de l'évènement n'est pas affichée
    Et le nom du fournisseur d'identité de l'évènement est "FIP1-LOW - eIDAS LOW - NO DISCOVERY"
    Et le niveau de sécurité de l'évènement est "Faible"
    Et j'affiche le détail du dernier évènement "Autorisation" sur "FranceConnect" du fournisseur de service "fsp3-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Autorisation"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne aucune donnée "FCP_LOW"
    Et l'évènement concerne 5 données "DGFIP"
    Et les données "DGFIP" de l'évènement contiennent "Revenu fiscal de référence"
    Et les données "DGFIP" de l'évènement contiennent "Nombre de parts du foyer fiscal"
    Et les données "DGFIP" de l'évènement contiennent "Situation de famille (marié, pacsé, célibataire, veuf, divorcé)"
    Et les données "DGFIP" de l'évènement contiennent "Détail des personnes à charge et rattachées"
    Et les données "DGFIP" de l'évènement contiennent "Adresse déclarée au 1er Janvier"
    Et l'évènement concerne 1 donnée "CNAM"
    Et les données "CNAM" de l'évènement contiennent "Paiements d’indemnités journalières versées par l’Assurance Maladie"
    Et j'affiche le détail du 1er évènement "Échange de Données" sur "FranceConnect" du FS "fsp3-low" avec le FD "DGFIP"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Échange de Données"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne aucune donnée "FCP_LOW"
    Et l'évènement concerne aucune donnée "CNAM"
    Et l'évènement concerne 5 données "DGFIP"
    Et les données "DGFIP" de l'évènement contiennent "Revenu fiscal de référence"
    Et les données "DGFIP" de l'évènement contiennent "Nombre de parts du foyer fiscal"
    Et les données "DGFIP" de l'évènement contiennent "Situation de famille (marié, pacsé, célibataire, veuf, divorcé)"
    Et les données "DGFIP" de l'évènement contiennent "Détail des personnes à charge et rattachées"
    Et les données "DGFIP" de l'évènement contiennent "Adresse déclarée au 1er Janvier"
    Et j'affiche le détail du 1er évènement "Échange de Données" sur "FranceConnect" du FS "fsp3-low" avec le FD "CNAM"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Échange de Données"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de l'évènement correspondent à maintenant
    Et l'évènement concerne aucune donnée "FCP_LOW"
    Et l'évènement concerne aucune donnée "DGFIP"
    Et l'évènement concerne 1 donnée "CNAM"
    Et les données "CNAM" de l'évènement contiennent "Paiements d’indemnités journalières versées par l’Assurance Maladie"

  Scénario: Historique Connexion - FranceConnect(v2) - FS privé avec scope anonyme
    Etant donné que j'utilise un compte usager "pour les tests de traces"
    Et que j'utilise le fournisseur de service "privé avec consentement obligatoire"
    Et que le fournisseur de service requiert l'accès aux informations du scope "anonyme"
    Et que j'ai fait une cinématique FranceConnect avec appel aux FD
    Et que les traces "FranceConnect(v2)" sont récupérées dans elasticsearch
    Et que je navigue sur la page d'accueil du tableau de bord usager
    Quand je me connecte au tableau de bord usager
    Alors je suis redirigé vers la page historique du tableau de bord usager
    Et 1 évènement "FranceConnect" est affiché
    Et j'affiche le détail du dernier évènement "Connexion" sur "FranceConnect" du fournisseur de service "fsp3-low"
    Et la plateforme de l'évènement est "FranceConnect"
    Et le type d'action de l'évènement est "Connexion"
    Et la date de l'évènement correspond à aujourd'hui
    Et le fournisseur de service de l'évènement est "fsp3-low"
    Et la date et heure de connexion correspondent à maintenant
    Et la localisation de l'évènement n'est pas affichée
    Et le nom du fournisseur d'identité de l'évènement est "FIP1-LOW - eIDAS LOW - NO DISCOVERY"
    Et le niveau de sécurité de l'évènement est "Faible"
