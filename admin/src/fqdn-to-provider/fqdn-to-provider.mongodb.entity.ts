import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity('fqdnToProvider')
export class FqdnToProvider {
  @ObjectIdColumn()
  _id: ObjectID;

  @IsString()
  @Column()
  fqdn: string;

  @IsString()
  @Column()
  identityProvider: string;

  @IsBoolean()
  @Column()
  acceptsDefaultIdp: boolean;
}
