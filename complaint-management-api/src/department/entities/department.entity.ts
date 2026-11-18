import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "../../users/entities/user.entity.js"; // missing
//import { StaffProfile } from "../../staff-profiles/entities/staff-profile.entity.js";
import { Category } from "../../categories/entities/category.entity.js"; // missing
import { StaffProfile } from "../../staff-profile/entities/staff-profile.entity.js";

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn()
  departmentId: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ name: "department_head_id", type: "int", nullable: true })
  departmentHeadId: number | null;

  @Column({ type: "text", nullable: true })
  description: string | null;

  @Column({
    name: "contact_email",
    type: "varchar",
    length: 150,
    nullable: true,
  })
  contactEmail: string | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToOne(() => User, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "department_head_id" })
  head: User | null;

  @OneToMany(() => StaffProfile, (s) => s.department)
  staffProfiles: StaffProfile[];

  @OneToMany(() => Category, (c) => c.department)
  categories: Category[];
}
