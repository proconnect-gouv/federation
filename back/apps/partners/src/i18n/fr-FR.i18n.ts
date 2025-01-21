import { frFR as frAsyncLocalStorage } from '@fc/async-local-storage/i18n';
import { frFR as frCsrf } from '@fc/csrf/i18n';
import { frFR as frDto2Form } from '@fc/dto2form/i18n';
import { I18nTranslationsMapType } from '@fc/i18n';
import { frFR as frI18n } from '@fc/i18n/i18n';
import { frFR as frOidcClient } from '@fc/oidc-client/i18n';
import { frFR as frSession } from '@fc/session/i18n';
import { frFR as frViewTemplates } from '@fc/view-templates/i18n';

export const frFR: I18nTranslationsMapType = {
  // Keys from used libraries
  ...frAsyncLocalStorage,
  ...frCsrf,
  ...frDto2Form,
  ...frI18n,
  ...frOidcClient,
  ...frSession,
  ...frViewTemplates,

  // form create instance label
  'Form.label.instance_name': 'Nom de l’instance',
  'Form.label.sp_name': 'Nom du Fournisseur de Service',
  'Form.label.signup_id': 'Numéro de la demande datapass',
  'Form.label.site': 'URL du site',
  'Form.label.redirect_uris': 'URL de connexion',
  'Form.label.post_logout_redirect_uris': 'URL de déconnexion',
  'Form.label.ipAddresses': 'Adresse IP',
  'Form.label.signed_response_alg': 'Algorithme de signature',
  'Form.label.use_entity_id':
    'Souhaitez-vous réutiliser les subs d’un de vos Fournisseurs de Service FranceConnect ?',
  'Form.label.entity_id': 'Client ID FranceConnect',

  // form create instance label description
  'Form.hintText.instance_name': 'Exemple : Commune de Paris - Portail Citoyen',
  'Form.hintText.sp_name':
    'Renseignez ici le nom du Fournisseur de Service, tel qu’il a été déclaré dans votre demande Datapass',
  'Form.hintText.signup_id':
    'Renseignez ici le numéro de la demande Datapass qui a été validée',
  'Form.hintText.site': 'Renseignez ici votre URL de site',
  'Form.hintText.redirect_uris': 'Exemple : https://www.paris.fr/callback',
  'Form.hintText.post_logout_redirect_uris':
    'Exemple : https://www.paris.fr/logout',
  'Form.hintText.ipAddresses':
    'Renseignez ici les adresses IP utilisées par votre Fournisseur de Service Exemple : 185.24.184.100 (IPv4), 2001:0db8:0000:85a3:0000:0000:ac1f:8001/59 (IPv6)',
  'Form.hintText.signed_response_alg':
    'Renseignez ici l’algorithme de signature que vous souhaitez utiliser pour la signature des jetons transmis par FranceConnect',
  'Form.hintText.use_entity_id':
    'Dans le cas où vous auriez un Fournisseur de Service FranceConnect, vous avez la possibilité que les subs générés pour votre Fournisseur de Service FranceConnect-v2 ou FranceConnect+ soient les mêmes que ceux générés pour votre Fournisseur de Service FranceConnect',
  'Form.hintText.entity_id':
    'Veuillez saisir le client id de votre fournisseur de service FranceConnect v1',

  // common error field
  // instance_name
  'Form.isFilled_error.instance_name':
    'Veuillez saisir le nom de votre instance',
  'Form.isString_error.instance_name': 'Veuillez saisir un nom valide',
  'Form.isLength_error.max.instance_name':
    'Le nom de l’instance doit être de {max} caractères maximum',
  // sp_name
  'Form.isFilled_error.sp_name':
    'Veuillez saisir le nom de votre fournisseur de service',
  'Form.isString_error.sp_name': 'Veuillez saisir un nom valide',
  'Form.isLength_error.max.sp_name':
    'Le nom de votre fournisseur de service doit être de {max} caractères maximum',
  // signup_id
  'Form.isNumeric_error.signup_id': 'Veuillez saisir un numéro valide',
  'Form.isLength_error.max.signup_id':
    'Le numéro de la demande datapass doit être de {max} caractères maximum',
  // site
  'Form.isFilled_error.site': 'Veuillez saisir votre url de site',
  'Form.isWebsiteURL_error.site': 'Veuillez saisir une url valide',
  'Form.isLength_error.max.site':
    'L’url de site doit être de {max} caractères maximum',
  // redirect_uris
  'Form.isFilled_error.redirect_uris':
    'Veuillez saisir votre url de connexion (url de callback)',
  'Form.isRedirectURL_error.redirect_uris': 'Veuillez saisir une url valide',
  'Form.isLength_error.max.redirect_uris':
    'L’url de connexion doit être de {max} caractères maximum',
  // post_logout_redirect_uris
  'Form.isFilled_error.post_logout_redirect_uris':
    'Veuillez saisir votre url de déconnexion (url de logout)',
  'Form.isRedirectURL_error.post_logout_redirect_uris':
    'Veuillez saisir une url valide',
  'Form.isLength_error.max.post_logout_redirect_uris':
    'L’url de déconnexion doit être de {max} caractères maximum',
  // ipAddresses
  'Form.isIpAddressesAndRange_error.ipAddresses':
    'Veuillez saisir une adresse IP valide',
  // signed_response_alg
  'Form.isFilled_error.signed_response_alg': 'Ce champ est obligatoire',
  'Form.isString_error.signed_response_alg':
    'Veuillez sélectionner votre algorithme de signature',
  'Form.isSignedResponseAlg_error.signed_response_alg':
    'Les algorithmes de signature autorisés sont les suivants: ES256 et RS256',
  // use_entity_id
  'Form.isFilled_error.use_entity_id': 'Ce champ est obligatoire',
  'Form.isString_error.use_entity_id':
    'Veuillez définir si vous souhaitez utiliser votre client id',
  // entity_id
  'Form.isLength_error.max.min.entity_id':
    'Le client id doit être compris entre {min} et {max} caractères',
  'Form.matches_error.entity_id':
    'Veuillez saisir le client id de votre fournisseur de service FranceConnect v1',
};
