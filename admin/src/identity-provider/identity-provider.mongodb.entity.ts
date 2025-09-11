import { Column, Entity, ObjectId, ObjectIdColumn, Unique } from 'typeorm';

@Entity('provider')
@Unique(['name'])
export class IdentityProviderFromDb {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  uid: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @Column()
  display: boolean;

  @Column()
  title: string;

  @Column()
  image: string;

  @Column()
  imageFocus: string;

  @Column()
  alt: string;

  @Column()
  eidas: number;

  @Column()
  allowedAcr: string[];

  @Column()
  mailto: string;

  @Column()
  specificText: string;

  @Column()
  url: string;

  @Column()
  statusURL: string;

  @Column()
  authzURL?: string;

  @Column()
  tokenURL?: string;

  @Column()
  userInfoURL?: string;

  @Column()
  endSessionURL: string;

  @Column()
  discoveryUrl?: string;

  @Column()
  discovery: boolean;

  @Column()
  isBeta: boolean;

  @Column()
  jwksURL?: string;

  @Column()
  jwtAlgorithm: string[];

  @Column()
  clientID: string;

  @Column()
  // oidc variable
  // tslint:disable-next-line: variable-name
  client_secret: string;

  @Column()
  order: number;

  @Column()
  hoverMsg: string;

  @Column()
  hoverRedirectLink: string;

  @Column()
  trustedIdentity: boolean;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  updatedBy: string;

  @Column()
  blacklistByIdentityProviderActivated: boolean;

  @Column()
  WhitelistByServiceProviderActivated: boolean;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  userinfo_encrypted_response_enc?: string;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  userinfo_encrypted_response_alg?: string;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  userinfo_signed_response_alg?: 'RS256' | 'ES256' | 'HS256' | '';

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  id_token_signed_response_alg?: 'RS256' | 'ES256' | 'HS256';

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  id_token_encrypted_response_alg?: string;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  id_token_encrypted_response_enc?: string;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  token_endpoint_auth_method?: string;

  @Column()
  amr?: string[];

  @Column()
  modal?: {
    active: boolean;
    title: string;
    body: string;
    continueText: string;
    moreInfoLabel: string;
    moreInfoUrl: string;
  };

  @Column()
  siret: string;

  @Column()
  supportEmail?: string;

  @Column()
  revocation_endpoint_auth_method: string;

  @Column()
  response_types: string[];

  @Column()
  featureHandlers?: any;
}
