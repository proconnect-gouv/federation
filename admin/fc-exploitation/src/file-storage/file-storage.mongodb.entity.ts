import {
  Entity,
  ObjectIdColumn,
  ObjectID,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('file')
export class FileStorage {
  @ObjectIdColumn()
  id: ObjectID;

  @Column()
  fieldname: string;

  @Column()
  originalname: string;

  @Column()
  encoding: string;

  @Column()
  mimetype: string;

  @Column()
  buffer: Buffer;

  @Column()
  size: number;
}
