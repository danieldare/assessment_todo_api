import { Entity, Column, ManyToOne, OneToMany, Unique } from 'typeorm';
import GenericEntity from '../database/generic.entity';
import { User } from '../user/user.entity';
import { Task } from '../task/task.entity';

@Entity()
@Unique(['name', 'user'])
export class Todo extends GenericEntity {
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ManyToOne(() => User, (user) => user.todos, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: User;

  @OneToMany(() => Task, (task) => task.todo)
  tasks: Task[];
}
