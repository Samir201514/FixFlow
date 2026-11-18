import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Priority } from '../enums/priority.enum.js';
import { ComplaintStatus } from '../enums/complaint-status.enum.js';
import type { User } from '../../users/entities/user.entity.js';
import type { Category } from '../../categories/entities/category.entity.js';
import type { ComplaintTag } from '../../complaint-tags/entities/complaint-tag.entity.js';
import type { ComplaintAssignment } from '../../complaint-assignments/entities/complaint-assignment.entity.js';
import type { ComplaintHistory } from '../../complaint-history/entities/complaint-history.entity.js';
import type { ComplaintAttachment } from '../../complaint-attachment/entities/complaint-attachment.entity.js';
import type { Notification } from '../../notifications/entities/notification.entity.js';
import type { Feedback } from '../../feedback/entities/feedback.entity.js';

@Entity('complaints')
@Index(['reporterId', 'status'])
@Index(['status', 'priority'])
@Index(['categoryId'])
export class Complaint {
  @PrimaryGeneratedColumn()
  complaintId: number;

  @Column({ name: 'reporter_id' })
  reporterId: number;

  @Column({ length: 30, unique: true })
  trackingCode: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'enum', enum: Priority })
  priority: Priority;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.SUBMITTED,
  })
  status: ComplaintStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolvedAt: Date | null;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne('User', (user: User) => user.complaints, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne('Category', (category: Category) => category.complaints, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany('ComplaintTag', (ct: ComplaintTag) => ct.complaint)
  complaintTags: ComplaintTag[];

  @OneToMany('ComplaintAssignment', (a: ComplaintAssignment) => a.complaint)
  assignments: ComplaintAssignment[];

  @OneToMany('ComplaintHistory', (h: ComplaintHistory) => h.complaint)
  history: ComplaintHistory[];

  @OneToMany('ComplaintAttachment', (a: ComplaintAttachment) => a.complaint)
  attachments: ComplaintAttachment[];

  @OneToMany('Notification', (n: Notification) => n.complaint)
  notifications: Notification[];

  // the join column of this one-to-one sits on Feedback
  @OneToOne('Feedback', (f: Feedback) => f.complaint)
  feedback: Feedback;
}
