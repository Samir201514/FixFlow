import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

@Entity('complaint_history')
@Index(['complaintId', 'changedAt'])
export class ComplaintHistory {
  @PrimaryGeneratedColumn()
  historyId: number;

  @Column()
  complaintId: number;

  @Column({ type: 'varchar', length: 10 })
  changedById: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  oldStatus: string;

  @Column({ type: 'varchar', length: 50 })
  newStatus: string;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;
}