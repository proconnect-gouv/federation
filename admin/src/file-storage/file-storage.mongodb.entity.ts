import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn } from "typeorm";

@Entity("file")
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
