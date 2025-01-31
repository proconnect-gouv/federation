import { DefaultServiceProviderLowValueConfig } from '@fc/partners';
import {
  cnafMsa,
  cnam,
  cnous,
  dgfip,
  dss,
  fcpLow,
  ft,
  mesri,
  mi,
} from '@fc/scopes';
import {
  ClientTypeEnum,
  EncryptionAlgorithmEnum,
  EncryptionEncodingEnum,
  PlatformEnum,
  SignatureAlgorithmEnum,
} from '@fc/service-provider';

export default {
  scope: [
    ...new Set([
      ...Object.keys(fcpLow.scopes),
      ...Object.keys(dgfip.scopes),
      ...Object.keys(cnam.scopes),
      ...Object.keys(cnous.scopes),
      ...Object.keys(mesri.scopes),
      ...Object.keys(mi.scopes),
      ...Object.keys(ft.scopes),
      ...Object.keys(cnafMsa.scopes),
      ...Object.keys(dss.scopes),
    ]),
  ],
  claims: ['amr'],
  eidas: 1,
  rep_scope: [],

  platform: PlatformEnum.CORE_FCP,

  idpFilterExclude: true,
  idpFilterList: [],

  active: true,
  type: ClientTypeEnum.PUBLIC,
  identityConsent: false,
  ssoDisabled: false,

  id_token_encrypted_response_alg: EncryptionAlgorithmEnum.NONE,
  id_token_encrypted_response_enc: EncryptionEncodingEnum.NONE,
  userinfo_signed_response_alg: SignatureAlgorithmEnum.NONE,
  userinfo_encrypted_response_alg: EncryptionAlgorithmEnum.NONE,
  userinfo_encrypted_response_enc: EncryptionEncodingEnum.NONE,

  /**
   * @TODO FC-2050
   *
   * For now use client_id and client_secret of FSP1-LOW
   * */
  client_secret:
    'a970fc88b3111fcfdce515c2ee03488d8a349e5379a3ba2aa48c225dcea243a5',
  client_id: '6925fb8143c76eded44d32b40c0cb1006065f7f003de52712b78985704f39950',
} as DefaultServiceProviderLowValueConfig;
