import {
  Check, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity.js';

@Entity('feedback')
@Check('chk_feedback_rating', '"rating" BETWEEN 1 AND 5')
export class Feedback {
  @PrimaryGeneratedColumn()
  feedbackId: number;

  @Column({ name: 'complaint_id' })
  complaintId: number;

  @Column({ type: 'smallint' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @OneToOne(() => Complaint, (complaint) => complaint.feedback, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'complaint_id', referencedColumnName: 'complaintId' })
  complaint: Relation<Complaint>;
}
