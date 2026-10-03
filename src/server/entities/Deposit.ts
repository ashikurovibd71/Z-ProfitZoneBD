import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import type { User } from './User';

@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne('User', (user: User) => user.deposits)
  user!: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column()
  paymentMethod!: string; // bkash, nagad, bank

  @Column()
  lastDigitNumber!: string;

  @Column()
  transactionId!: string;

  @Column({ default: 'pending' }) // pending, approved, rejected
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
