import {
  Entity,
  Column,
  ManyToOne,
  DeleteDateColumn,
  AfterLoad,
} from 'typeorm';
import { Todo } from '../todo/todo.entity';
import { TaskStatus } from '../types/enums';
import GenericEntity from '../database/generic.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Task extends GenericEntity {
  @Column({ nullable: false, type: 'text' })
  description: string;

  @Column({ type: 'datetime', nullable: false })
  dueDate: Date;

  @Column({
    default: TaskStatus.PENDING,
    type: 'enum',
    enum: TaskStatus,
    nullable: false,
  })
  status: TaskStatus;

  @ManyToOne(() => Todo, (todo) => todo.tasks, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  todo: Todo;

  @DeleteDateColumn({ select: false })
  deletedAt: Date;

  @Expose()
  code: string | null;

  /**
   * Returns the code color based on the task's status and due date.
   * @returns The code color as a string ('green', 'amber', 'red') or null if the status is not 'PENDING'.
   */
  @AfterLoad()
  getCode() {
    if (this.status !== TaskStatus.PENDING) {
      this.code = null;
    }

    const now = new Date();
    const dueDate = new Date(this.dueDate);
    const diffInMs = dueDate.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours >= 72) {
      this.code = 'green';
    } else if (diffInHours < 24 && diffInHours > 3) {
      this.code = 'amber';
    } else if (diffInHours <= 3) {
      this.code = 'red';
    } else {
      this.code = 'undecided';
    }
  }
}
