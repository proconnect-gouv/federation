/* istanbul ignore file */
// Declarative code
import { Entity, ObjectIdColumn, ObjectId, Column, Unique } from 'typeorm';

@Entity('scopes')
@Unique(['scope'])
export class Scopes {
  @ObjectIdColumn()
  id: ObjectId;

  @Column({ name: 'scope' })
  scope: string;

  @Column({ name: 'fd' })
  fd: string;

  @Column({ name: 'label' })
  label: string;

  @Column({ name: 'updatedBy' })
  updatedBy: string;
}
