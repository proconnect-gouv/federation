export interface ServiceProviderGristRecord {
  Reseau: string;
  Environnement: string;
  UID: string;
  Nom: string;
  Liste_des_URL_de_callback: string;
  Liste_des_URL_de_logout: string;
  Actif: 'Oui' | 'Non';
  Accepte_le_prive: 'Oui' | 'Non';
  Alg_ID_token: string;
  Alg_userinfo: string;
  Scopes: string;
}
