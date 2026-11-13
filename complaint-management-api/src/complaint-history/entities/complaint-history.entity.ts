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
import { ComplaintStatus } from '../../complaints/enums/complaint-status.enum.js';

@Entity('complaint_history')
@Index(['complaintId', 'changedAt'])
export class ComplaintHistory {
  @PrimaryGeneratedColumn()
  historyId: number;

  @Column()
  complaintId: number;

  @Column()
  changedById: number;

  @Column({ type: 'enum', enum: ComplaintStatus, nullable: true })
  oldStatus: ComplaintStatus;

  @Column({ type: 'enum', enum: ComplaintStatus })
  newStatus: ComplaintStatus;

  @Column({ type: 'text', nullable: true })
  remarks: string;

  @CreateDateColumn({ type: 'timestamptz' })
  changedAt: Date;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User;
}