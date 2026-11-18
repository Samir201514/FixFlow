import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ComplaintTag } from "../../complaint-tags/entities/complaint-tag.entity.js";
//import { ComplaintTag } from "../../complaints/entities/complaint.entity.js"; // P1's junction entity

@Entity("tags")
export class Tag {
  @PrimaryGeneratedColumn()
  tagId: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToMany(() => ComplaintTag, (ct) => ct.tagId)
  complaintTags: ComplaintTag[];
}
