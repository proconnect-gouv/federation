import { Column, Entity, ObjectIdColumn, Unique } from 'typeorm';
import { ObjectId } from 'mongodb';

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
  title: string;

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
  jwksURL?: string;

  @Column()
  clientID: string;

  @Column()
  // oidc variable
  // tslint:disable-next-line: variable-name
  client_secret: string;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  updatedBy: string;

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
  siret: string;

  @Column()
  supportEmail?: string;
}
