import { IsBoolean, IsString } from 'class-validator';
import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectId } from 'mongodb';

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
