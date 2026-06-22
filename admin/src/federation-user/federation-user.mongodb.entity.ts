import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";
import { IdpIdentityKey } from "./interfaces/idp-identity-key.interface";

@Entity("accountFca")
export class FederationUser {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  sub: string;

  @Column()
  lastConnection: Date;

  @Column()
  idpIdentityKeys: IdpIdentityKey[];

  @Column()
  active: boolean;
}
