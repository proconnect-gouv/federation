import {
  Entity,
  ObjectIdColumn,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('client')
export class ServiceProviderFromDb {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  title: string;

  @Column()
  name: string;

  @Column()
  active: boolean;

  @Column()
  type: string;

  @Column({ name: 'IPServerAddressesAndRanges' })
  IPServerAddressesAndRanges: string[];

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'redirect_uris' })
  // tslint:disable-next-line: variable-name
  redirect_uris: string[];

  @Column({ name: 'post_logout_redirect_uris' })
  // tslint:disable-next-line: variable-name
  post_logout_redirect_uris: string[];

  @Column({ name: 'secretCreatedAt' })
  secretCreatedAt: Date;

  @Column({ name: 'createdAt' })
  createdAt: Date;

  @Column({ name: 'updatedAt' })
  updatedAt?: Date;

  @Column({ name: 'updatedBy' })
  updatedBy: string;

  @PrimaryGeneratedColumn('uuid')
  @Column({ name: 'key' })
  key: string;

  @Column({ name: 'entityId' })
  entityId: string;

  @Column({ name: 'signup_id' })
  // tslint:disable-next-line: variable-name
  signup_id?: string;

  @Column({ name: 'client_secret' })
  // tslint:disable-next-line: variable-name
  client_secret: string;

  @Column({ name: 'secretUpdatedAt' })
  secretUpdatedAt?: Date;

  @Column({ name: 'secretUpdatedBy' })
  secretUpdatedBy?: string;

  @Column({ name: 'scopes' })
  scopes: string[];

  @Column({ name: 'claims' })
  claims?: string[];

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  userinfo_signed_response_alg?: string;

  @Column()
  // oidc defined variable name
  // tslint:disable-next-line: variable-name
  id_token_signed_response_alg?: string;

  @Column()
  ssoDisabled?: boolean;

  @Column()
  // tslint:disable-next-line: variable-name
  introspection_signed_response_alg?: string | null;

  @Column()
  // tslint:disable-next-line: variable-name
  introspection_encrypted_response_alg?: string | null;

  @Column()
  // tslint:disable-next-line: variable-name
  introspection_encrypted_response_enc?: string | null;

  @Column()
  // tslint:disable-next-line: variable-name
  response_types?: string[] | null;

  @Column()
  // tslint:disable-next-line: variable-name
  grant_types?: string[] | null;

  @Column()
  // tslint:disable-next-line: variable-name
  jwks_uri: string;
}
