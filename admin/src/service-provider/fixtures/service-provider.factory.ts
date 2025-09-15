import { ServiceProviderDto } from '../dto/service-provider-input.dto';
import { ServiceProviderFromDb } from '../service-provider.mongodb.entity';
import { ObjectId } from 'mongodb';

const serviceProviderFactory = {
  createServiceProviderDto,
  createServiceProviderFromDb,
};

function createServiceProviderDto(
  partial: Partial<ServiceProviderDto>,
): ServiceProviderDto {
  return {
    name: 'monfs',
    redirectUri: ['https://monfs.com'],
    redirectUriLogout: ['https://monfs.com/logout'],
    ipAddresses: ['192.0.0.0'],
    emails: ['jean.dupont@mail.fr'],
    active: true,
    type: 'private',
    scopes: [],
    claims: [],
    entityId: 'entityId',
    userinfo_signed_response_alg: 'RS256',
    id_token_signed_response_alg: 'RS256',
    response_types: ['code'],
    introspection_signed_response_alg: 'RS256',
    introspection_encrypted_response_alg: 'RS256',
    introspection_encrypted_response_enc: 'A128CBC-HS256',
    grant_types: ['authorization_code'],
    jwks_uri: 'https://monfs.com/jwks',
    ...partial,
  };
}

function createServiceProviderFromDb(
  partial: Partial<ServiceProviderFromDb>,
): ServiceProviderFromDb {
  return {
    _id: new ObjectId(),
    title: 'monfs',
    name: 'monfs',
    redirect_uris: ['https://monfs.com'],
    post_logout_redirect_uris: ['https://monfs.com/logout'],
    IPServerAddressesAndRanges: ['192.0.0.0'],
    email: 'v@b.com',
    active: true,
    type: 'private',
    scopes: [],
    claims: [],
    entityId: 'entityId',
    userinfo_signed_response_alg: 'RS256',
    id_token_signed_response_alg: 'RS256',
    response_types: ['code'],
    introspection_signed_response_alg: 'RS256',
    introspection_encrypted_response_alg: 'RS256',
    introspection_encrypted_response_enc: 'A128CBC-HS256',
    grant_types: ['authorization_code'],
    jwks_uri: 'https://monfs.com/jwks',
    client_secret: 'clientSecret',
    createdAt: new Date(),
    secretCreatedAt: new Date(),
    updatedAt: new Date(),
    secretUpdatedAt: new Date(),
    key: 'key',
    updatedBy: 'user',
    trustedIdentity: false,
    ...partial,
  };
}

export { serviceProviderFactory };
