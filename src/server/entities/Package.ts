import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany , type Relation } from 'typeorm';
import { UserPackage } from './UserPackage';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ type: 'int' })
  durationDays!: number;

  @Column({ type: 'int' })
  dailyTasks!: number;

  @OneToMany(() => UserPackage, (userPackage: UserPackage) => userPackage.package)
  userPackages!: Relation<UserPackage>[];

  @CreateDateColumn()
  createdAt!: Date;
}
