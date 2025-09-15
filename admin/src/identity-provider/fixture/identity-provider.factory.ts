import { ObjectId } from 'mongodb';
import { IdentityProviderDTO } from '../dto/identity-provider.dto';
import { IdentityProviderFromDb } from '../identity-provider.mongodb.entity';

function createIdentityProviderFromDb(
  partial: Partial<IdentityProviderFromDb>,
): IdentityProviderFromDb {
  return {
    _id: new ObjectId('68a30acf6cb39008b0015ab4'),
    name: 'Default Name',
    mailto: 'mailto:default@email.fr',
    jwtAlgorithm: ['ES256'],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    updatedBy: 'jean_patoche',
    WhitelistByServiceProviderActivated: false,
    blacklistByIdentityProviderActivated: false,
    hoverMsg: '',
    hoverRedirectLink: '',
    active: true,
    allowedAcr: [],
    alt: '',
    amr: [],
    authzURL: 'https://default.authorization-url.fr',
    clientID: 'default_client_id',
    client_secret: 'default_client_secret',
    discoveryUrl: 'https://default.discovery-url.fr',
    discovery: true,
    image: '',
    imageFocus: '',
    isBeta: false,
    endSessionURL: 'https://default.logout-url.fr',
    url: 'https://default.issuer.fr',
    order: 0,
    specificText: '',
    statusURL: 'https://default.status-url.fr',
    title: 'Default Title',
    id_token_encrypted_response_alg: 'default_alg',
    id_token_encrypted_response_enc: 'default_enc',
    id_token_signed_response_alg: 'ES256',
    jwksURL: 'https://default.jwks-url.fr',
    siret: '',
    supportEmail: 'support@email.fr',
    token_endpoint_auth_method: 'default_auth_method',
    tokenURL: 'https://default.token-url.fr',
    userinfo_encrypted_response_alg: 'default_userinfo_alg',
    userinfo_encrypted_response_enc: 'default_userinfo_enc',
    userinfo_signed_response_alg: 'ES256',
    userInfoURL: 'https://default.userinfo-url.fr',
    uid: 'default_uid',
    ...partial,
  };
}

function createIdentityProviderDto(
  partial: Partial<IdentityProviderDTO>,
): IdentityProviderDTO {
  return {
    name: 'Default Name',
    active: true,
    allowedAcr: [],
    alt: 'MonFI Image',
    image: 'AliceM.svg',
    imageFocus: 'AliceM.svg',
    amr: [],
    discoveryUrl: 'https://default.discovery-url.fr',
    discovery: true,
    isBeta: false,
    logoutUrl: 'https://default.logout-url.fr',
    issuer: 'https://issuer.fr',
    authorizationUrl: 'https://issuer.fr/auth',
    tokenUrl: 'https://issuer.fr/token',
    userInfoUrl: 'https://issuer.fr/me',
    statusUrl: 'https://issuer.fr/state',
    jwksUrl: 'https://issuer.fr/jwks',
    clientId: '09a1a257648c1742c74d6a3d84b31943',
    client_secret: '1234567890AZERTYUIOP',
    messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
    redirectionTargetWhenInactive: 'https://issuer.fr/promo',
    order: 0,

    specificText:
      "Veuillez fournir une capture d'écran de votre page de profil !",
    title: 'Default Title',
    userinfo_encrypted_response_enc: 'ES256',
    userinfo_encrypted_response_alg: 'RSA-OAEP',
    userinfo_signed_response_alg: 'ES256',
    id_token_signed_response_alg: 'ES256',
    id_token_encrypted_response_alg: 'RSA-OAEP',
    id_token_encrypted_response_enc: 'A256GCM',
    token_endpoint_auth_method: 'client_secret_post',
    emails: ['sherman@kaliop.com', 'nvbonnard@kaliopmail.com'],
    fqdns: [],
    post_logout_redirect_uris: [],
    redirect_uris: [],
    siret: '',
    supportEmail: 'support@email.fr',
    ...partial,
  };
}

const identityProviderFactory = {
  createIdentityProviderFromDb,
  createIdentityProviderDto,
};

export { identityProviderFactory };
