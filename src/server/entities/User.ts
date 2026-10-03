import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import type { Deposit } from './Deposit';
import type { UserPackage } from './UserPackage';
import type { UserTask } from './UserTask';
import type { Withdrawal } from './Withdrawal';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  phone!: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null;

  @Column()
  passwordHash!: string;

  @Column({ type: 'varchar', nullable: true })
  profilePicture!: string | null;

  @Column({ type: 'varchar', nullable: true })
  nidFront!: string | null;

  @Column({ type: 'varchar', nullable: true })
  nidBack!: string | null;

  @Column({ default: 'pending' }) // pending, approved, rejected
  kycStatus!: string;

  @Column({ default: 'user' }) // admin, user
  role!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  walletBalance!: number;

  @OneToMany('Deposit', (deposit: Deposit) => deposit.user)
  deposits!: Deposit[];

  @OneToMany('UserPackage', (userPackage: UserPackage) => userPackage.user)
  userPackages!: UserPackage[];

  @OneToMany('UserTask', (userTask: UserTask) => userTask.user)
  userTasks!: UserTask[];

  @OneToMany('Withdrawal', (withdrawal: Withdrawal) => withdrawal.user)
  withdrawals!: Withdrawal[];

  @Column({ type: 'timestamp', nullable: true })
  lastLogin!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
