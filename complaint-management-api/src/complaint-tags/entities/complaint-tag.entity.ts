import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity.js';

@Entity('complaint_tags')
@Index(['complaintId'])
export class ComplaintTag {
  @PrimaryGeneratedColumn()
  tagId: number;

  @Column()
  complaintId: number;

  @Column({ length: 50 })
  tagName: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.complaintTags, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaintId' })
  complaint: Complaint;
}