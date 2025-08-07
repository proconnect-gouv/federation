/* istanbul ignore file */
// Declarative code
import { Entity, ObjectIdColumn, Column, Unique } from 'typeorm';

@Entity('claims')
@Unique(['name'])
export class Claims {
  @ObjectIdColumn()
  id: string;

  @Column({ name: 'name' })
  name: string;
}
