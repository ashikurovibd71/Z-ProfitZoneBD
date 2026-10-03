import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Package } from './Package';

@Entity('user_packages')
export class UserPackage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user: User) => user.userPackages)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Package, (pkg: Package) => pkg.userPackages)
  @JoinColumn({ name: 'packageId' })
  package!: Package;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  purchasePrice!: number;

  @CreateDateColumn()
  purchasedAt!: Date;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @Column({ default: 'active' })
  status!: string; // 'active', 'expired'
}
