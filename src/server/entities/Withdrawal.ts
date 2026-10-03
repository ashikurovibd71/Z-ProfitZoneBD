import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { User } from './User';

@Entity('withdrawals')
export class Withdrawal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('User', (user: User) => user.withdrawals)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  method!: string; // bkash, nagad, bank, etc.

  @Column()
  accountNumber!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount!: number;

  @Column({ default: 'pending' }) // pending, approved, rejected
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
