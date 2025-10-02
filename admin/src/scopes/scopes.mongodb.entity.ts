/* istanbul ignore file */
// Declarative code
import { Entity, ObjectIdColumn, Column, Unique } from 'typeorm';
import { ObjectId } from 'mongodb';
@Entity('scopes')
@Unique(['scope'])
export class Scopes {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column({ name: 'scope' })
  scope: string;

  @Column({ name: 'fd' })
  fd: string;

  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'updatedBy' })
  updatedBy: string;
}
