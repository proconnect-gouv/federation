/* istanbul ignore file */
// Declarative code
import { ObjectId } from 'mongodb';
import { Entity, ObjectIdColumn, Column, Unique } from 'typeorm';

@Entity('claims')
@Unique(['name'])
export class Claims {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ name: 'name' })
  name: string;
}
