import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('fqdnToProvider')
export class FqdnToProvider {
  @ObjectIdColumn()
  _id: ObjectId;

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
