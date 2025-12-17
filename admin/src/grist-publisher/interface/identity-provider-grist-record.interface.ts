export interface IdentityProviderGristRecord {
  Reseau: string;
  Environnement: string;
  UID: string;
  Titre: string;
  Actif: 'Oui' | 'Non';
  URL_de_decouverte: string;
  Liste_des_FQDN: string;
  SIRET_par_defaut: string;
  Alg_ID_token: string;
  Alg_userinfo: string;
  Routage_active: 'Oui' | 'Non';
  Adresse_e_mail_de_support: string;
}
