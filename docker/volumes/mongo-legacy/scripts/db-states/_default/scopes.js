// -- Scopes - set all scopes by types with a description label
print('Add scopes...');
db.scopes.createIndex({ scope: 1 }, { unique: true });

// -- Scopes - IDENTITY
print('Initializing IDENTITY scopes...');
db.scopes.update(
  { scope: 'openid' },
  { scope: 'openid', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'given_name' },
  { scope: 'given_name', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'family_name' },
  { scope: 'family_name', fd: 'IDENTITY', label: 'Nom de naissance', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'preferred_username' },
  { scope: 'preferred_username', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'idp_id' },
  { scope: 'idp_id', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'idp_birthdate' },
  { scope: 'idp_birthdate', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'birthdate' },
  { scope: 'birthdate', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'gender' },
  { scope: 'gender', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'birthplace' },
  { scope: 'birthplace', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'birthcountry' },
  { scope: 'birthcountry', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'email' },
  { scope: 'email', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'address' },
  { scope: 'address', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'phone' },
  { scope: 'phone', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'profile' },
  { scope: 'profile', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'birth' },
  { scope: 'birth', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);
db.scopes.update(
  { scope: 'identite_pivot' },
  { scope: 'identite_pivot', fd: 'IDENTITY', label: '', __v: 0 },
  { upsert: true },
);

// --Scope - FranceConnect
db.scopes.update(
  { scope: 'connexion_tracks' },
  {
    scope: 'connexion_tracks',
    fd: 'FranceConnect',
    label: 'Historique de connexions',
    __v: 0,
  },
  { upsert: true },
);

// -- Scopes - DGFIP
print(
  'Initializing Direction générale des Finances publiques (DGFIP) scopes...',
);
db.scopes.updateOne(
  {
    scope: 'dgfip_rfr',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Revenu fiscal de référence (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_annee_n_moins_1',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Dernière année de revenu (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_annee_n_moins_2',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Avant-dernière année de revenu (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_annee_n_moins_3',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Avant-avant-dernière année de revenu (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nbpart',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Nombre de parts du foyer fiscal (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_sitfam',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Situation de famille (marié, pacsé, célibataire, veuf divorcé) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_aft',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Adresse déclarée au 1er Janvier (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nbpac',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Nombre de personnes à charge (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_inddeficit',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Indicateur de l’existence d’un déficit (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_pariso',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Parent isolé (case T) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_decl',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'État-civil des déclarants du foyer fiscal (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_pac',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Détail des personnes à charge et rattachées (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_locaux_th',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Données issues de la Taxe d’Habitation (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nmUsaDec1',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label: 'Nom déclarant 1 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nmNaiDec1',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Nom de naissance déclarant 1 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_prnmDec1',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label: 'Prénom déclarant 1 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_dateNaisDec1',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Date de naissance déclarant 1 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nmUsaDec2',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label: 'Nom déclarant 2 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_nmNaiDec2',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Nom de naissance déclarant 2 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_prnmDec2',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label: 'Prénom déclarant 2 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_dateNaisDec2',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Date de naissance déclarant 2 (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_locaux_th_ident',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Données du local - identifiant du logement (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_locaux_th_Nat',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Données du local – nature (maison, appartement, ect,) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_locaux_th_Tax',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Données du local - régime de taxation (résidence principale uniquement) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_locaux_th_Aff',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Données du local - affectation (« H » pour habitation) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_pac_nbPac',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Nombre de personnes à charge (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_mntRevbareme',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Montant de l’impôt sur les revenus soumis au barème (ligne 14) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_indiIFI',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label: 'Indicateur ISF/IFI (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat1_Tspr',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 1 - Salaires, pensions, rentes (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat1_RentOn',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 1 - Rentes viagères à titre onéreux (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat2_Rcm',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 2 - Revenus de capitaux mobiliers (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat3_PMV',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 3 - Plus ou moins values (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat4_Ref',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 4 - Revenus fonciers (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevDecl_Cat5_NonSal',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 5 - Revenus des professions non salariées (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat1_Tspr',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 1 - Salaires, pensions, rentes (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat1_RentOn',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 1 - Rentes viagères à titre onéreux (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat2_Rcm',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 2 - Revenus de capitaux mobiliers (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat3_PMV',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 3 - Plus ou moins values (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat4_Ref',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 4 - Revenus fonciers (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_RevNets_Cat5_NonSal',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Catégorie 5 - Revenus des professions non salariées (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_PaDeduc_EnfMaj',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Pensions alimentaires déductibles - Pension alimentaire versées à enfant majeur (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'fip_PaDeduc_Autres',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Pensions alimentaires déductibles - Autres pensions alimentaires versées (enfants mineurs, ascendants, ...) (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'dgfip_EpargRetrDeduc',
  },
  {
    $set: {
      fd: 'Direction générale des Finances publiques',
      label:
        'Versement épargne retraite (Direction générale des Finances publiques)',
    },
  },
  {
    upsert: true,
  },
);

// -- Scopes - Caisse nationale de l'assurance maladie
print("Initializing Caisse nationale de l'assurance maladie (CNAM) scopes...");
db.scopes.updateOne(
  {
    scope: 'ensagri_releve_notes',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Relevé de notes (Enseignement Agricole) (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'droits_assurance_maladie',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Droits assurance maladie (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_beneficiaires',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Liste de vos ayant-droits (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_contrats',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label: "Vos droits de base (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_caisse',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Votre caisse gestionnaire (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_exonerations',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Vos exonérations ou modulations éventuelles (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_medecin_traitant',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label: "Votre médecin traitant (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_beneficiaires',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Liste de vos ayant-droits (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_presence_medecin_traitant',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Présence d'un médecin traitant (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnam_paiements_ij',
  },
  {
    $set: {
      fd: "Caisse nationale de l'assurance maladie",
      label:
        "Paiements d'indemnités journalières versés par l'Assurance Maladie (Caisse nationale de l'assurance maladie)",
    },
  },
  {
    upsert: true,
  },
);

// -- Scopes - Ministère de l'Intérieur
print("Initializing Ministère de l'Intérieur scopes...");
db.scopes.updateOne(
  {
    scope: 'mi_siv_carte_grise',
  },
  {
    $set: {
      fd: "Ministère de l'Intérieur",
      label:
        "Informations de la carte grise: Titulaire et véhicule (Ministère de l'Intérieur)",
    },
  },
  {
    upsert: true,
  },
);

// -- Scopes - Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation
print(
  "Initializing Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation scopes...",
);
db.scopes.updateOne(
  {
    scope: 'mesri_identifiant',
  },
  {
    $set: {
      fd: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation",
      label:
        "Identifiant national étudiant (Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'mesri_inscription_etudiant',
  },
  {
    $set: {
      fd: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation",
      label:
        "Formation initiale (Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'mesri_inscription_autre',
  },
  {
    $set: {
      fd: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation",
      label:
        "Formation continue (Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'mesri_admission',
  },
  {
    $set: {
      fd: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation",
      label:
        "Admission (Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation)",
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'mesri_etablissements',
  },
  {
    $set: {
      fd: "Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation",
      label:
        "Établissements (Ministère de l'Enseignement supérieur, de la Recherche et de l'Innovation)",
    },
  },
  {
    upsert: true,
  },
);

// -- Scopes - Centre national des œuvres universitaires et scolaires
print(
  'Initializing Centre national des œuvres universitaires et scolaires scopes...',
);
db.scopes.updateOne(
  {
    scope: 'cnous_statut_boursier',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        'Statut boursier (Centre national des œuvres universitaires et scolaires)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnous_echelon_bourse',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        'Echelon de la bourse (Centre national des œuvres universitaires et scolaires)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnous_email',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        'Courriel (Centre national des œuvres universitaires et scolaires)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnous_periode_versement',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        'Période de versement (Centre national des œuvres universitaires et scolaires)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnous_statut_bourse',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        'Statut définitif de la bourse (Centre national des œuvres universitaires et scolaires)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'cnous_ville_etudes',
  },
  {
    $set: {
      fd: 'Centre national des œuvres universitaires et scolaires',
      label:
        "Ville d'étude (Centre national des œuvres universitaires et scolaires)",
    },
  },
  {
    upsert: true,
  },
);

// -- Scopes - Pôle emploi
print('Initializing Pôle emploi scopes...');
db.scopes.updateOne(
  {
    scope: 'api_fc-liste-paiementsv1',
  },
  {
    $set: {
      fd: 'Pôle emploi',
      label: 'Indemnités de Pôle emploi (Pôle emploi)',
    },
  },
  {
    upsert: true,
  },
);
db.scopes.updateOne(
  {
    scope: 'api_fc-statutaugmentev1',
  },
  {
    $set: {
      fd: 'Pôle emploi',
      label: "Statut demandeur d'emploi (Pôle emploi)",
    },
  },
  {
    upsert: true,
  },
);
