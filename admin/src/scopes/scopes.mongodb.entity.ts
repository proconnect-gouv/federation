/* istanbul ignore file */
// Declarative code
import { ObjectId } from "mongodb";
import { Column, Entity, ObjectIdColumn, Unique } from "typeorm";
@Entity("scopes")
@Unique(["scope"])
export class Scopes {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ name: "scope" })
  scope: string;

  @Column({ name: "fd" })
  fd: string;

  @Column({ name: "label" })
  label: string;

  @Column({ name: "updatedBy" })
  updatedBy: string;
}
