import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany , type Relation } from 'typeorm';
import { UserTask } from './UserTask';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column()
  url!: string;

  @Column({ default: 'auto' }) // auto, manual, subscribe, like, etc.
  type!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rewardAmount!: number;

  @Column({ default: 30 }) // Time in seconds required to complete
  durationSeconds!: number;

  @Column({ default: true })
  isActive!: boolean;

  @OneToMany(() => UserTask, (userTask: UserTask) => userTask.task)
  userTasks!: Relation<UserTask>[];

  @CreateDateColumn()
  createdAt!: Date;
}
