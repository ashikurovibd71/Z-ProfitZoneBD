import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn , type Relation } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('user_tasks')
export class UserTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user: User) => user.userTasks)
  @JoinColumn({ name: 'userId' })
  user!: Relation<User>;

  @ManyToOne(() => Task, (task: Task) => task.userTasks)
  @JoinColumn({ name: 'taskId' })
  task!: Relation<Task>;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  earnedAmount!: number;

  @Column({ type: 'date' })
  completedDate!: string; // YYYY-MM-DD for easy daily limit querying

  @CreateDateColumn()
  completedAt!: Date;
}
