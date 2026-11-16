import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ComplaintTag } from '../../complaints/entities/complaint-tag.entity.js'; // P1's junction entity

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  tagId: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  // Inverse side only. The FK tag_id lives on ComplaintTag, so no @JoinTable here.
  @OneToMany(() => ComplaintTag, (ct) => ct.tag)
  complaintTags: ComplaintTag[];
}