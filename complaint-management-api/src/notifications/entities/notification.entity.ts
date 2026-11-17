import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { Complaint } from '../../complaints/entities/complaint.entity.js';
import { NotificationType } from '../../common/enums/notification-type.enum.js';

@Entity('notifications')
@Index(['userId', 'readAt'])
export class Notification {
  @PrimaryGeneratedColumn()
  notificationId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'complaint_id', nullable: true })
  complaintId: number | null;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
  user: Relation<User>;

  @ManyToOne(() => Complaint, (complaint) => complaint.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'complaint_id', referencedColumnName: 'complaintId' })
  complaint: Relation<Complaint> | null;
}
