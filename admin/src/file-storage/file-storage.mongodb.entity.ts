import { Entity, ObjectIdColumn, Column } from 'typeorm';
import { ObjectId } from 'mongodb';

@Entity('file')
export class FileStorage {
  @ObjectIdColumn()
  id: ObjectId;

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
