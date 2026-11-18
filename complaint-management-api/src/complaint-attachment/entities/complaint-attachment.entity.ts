import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Complaint } from '../../complaints/entities/complaint.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity('complaint_attachments')
@Index(['complaintId'])
export class ComplaintAttachment {
  @PrimaryGeneratedColumn()
  attachmentId: number;

  @Column()
  complaintId: number;

  @Column()
  uploaderId: number;

  @Column({ length: 255 })
  fileName: string;

  @Column({ type: 'text' })
  fileUrl: string;

  @Column({ length: 50, nullable: true })
  fileType: string;

  @CreateDateColumn({ type: 'timestamptz' })
  uploadedAt: Date;

  
  @ManyToOne(() => Complaint, (complaint) => complaint.attachments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'complaintId' })
  complaint: Complaint;

  
  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'uploader_id' })
  uploader: User;
}