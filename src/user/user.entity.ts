import { Entity, Column, OneToMany } from 'typeorm';
import GenericEntity from '../database/generic.entity';
import { Todo } from '../todo/todo.entity';

@Entity()
export class User extends GenericEntity {
  @Column({ type: 'text', nullable: false })
  fullName: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email: string;

  @Column({ select: false, type: 'text', nullable: false })
  hash: string;

  @Column({ select: false, type: 'text', nullable: false })
  salt: string;

  @OneToMany(() => Todo, (todo) => todo.user)
  todos: Todo[];

  @Column({ type: 'bigint', nullable: false })
  tokenVersion: number;
}
