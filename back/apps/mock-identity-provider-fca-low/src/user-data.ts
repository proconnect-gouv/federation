import { chain } from 'lodash';
import QuickLRU from 'quick-lru';

const defaultUser = {
  sub: '1',
  // standard claims
  address: {
    country: '000',
    formatted: '000',
    locality: '000',
    postal_code: '000',
    region: '000',
    street_address: '000',
  },
  birthdate: '1987-10-16',
  email: 'johndoe@example.com',
  email_verified: false,
  family_name: 'Doe',
  gender: 'male',
  given_name: 'John',
  locale: 'en-US',
  middle_name: 'Middle',
  name: 'John Doe',
  nickname: 'Johny',
  phone_number: '+49 000 000000',
  phone_number_verified: false,
  picture: 'https://picsum.photos/200',
  preferred_username: 'johnny',
  profile: 'https://johnswebsite.com',
  // the user information was last updated 7 days ago
  updated_at: Math.floor(new Date().setDate(new Date().getDate() - 7) / 1000),
  website: 'http://example.com',
  zoneinfo: 'Europe/Berlin',
  // ProConnect claims
  siret: '13002526500013',
  // Deprecated ProConnect claims
  belonging_population: 'agent',
  'chorusdt:matricule': 'USER_AGC',
  'chorusdt:societe': 'CHT',
  is_service_public: true,
  organizational_unit: 'comptabilite',
  siren: '130025265',
  uid: '1',
  usual_name: 'Doe',
};

export const getDefaultUser = () => {
  return defaultUser;
};

const userStorage = new QuickLRU({ maxSize: 1000 });

export const createUser = (body) => {
  const {
    email,
    given_name,
    usual_name,
    siret,
    is_service_public,
    sub,
    phone_number,
  } = body;
  const id =
    email + given_name + usual_name + siret + is_service_public + phone_number;
  // replace default property values, allowing substitution of a default value with an empty string
  const user = chain({
    ...defaultUser,
    email,
    given_name,
    usual_name,
    siret,
    is_service_public,
    sub,
    phone_number,
  })
    // as per https://openid.net/specs/openid-connect-core-1_0.html#UserInfoResponse
    // > If a Claim is not returned, that Claim Name SHOULD be omitted from the JSON object representing the Claims;
    // > it SHOULD NOT be present with a null or empty string value.
    .omitBy((value) => value === '' || value === null)
    // cast boolean values
    // eslint-disable-next-line complexity
    .mapValues((value) => {
      switch (value) {
        case 'true':
          return true;
        case 'false':
          return false;
        case 'null':
          return null;
        case 'undefined':
          return undefined;
        case 'empty':
          return '';
        default:
          return value;
      }
    })
    .value();

  userStorage.set(id, user);
  return id;
};

export const findUserById = (id: string) => {
  return userStorage.get(id);
};
