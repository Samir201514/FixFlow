import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { User } from "../../users/entities/user.entity.js"; // miss
import { Department } from "../../departments/entities/department.entity.js";
import { ComplaintAssignment } from "../../complaint-assignments/entities/complaint-assignment.entity.js"; // miss

@Entity("staff_profiles")
export class StaffProfile {
  @PrimaryGeneratedColumn()
  staffProfileId: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "department_id" })
  departmentId: number;

  @Column({ length: 30, unique: true })
  employeeCode: string;

  @Column({ length: 100 })
  designation: string;

  @Column({ default: true })
  isAvailable: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @OneToOne(() => User, (u) => u.staffProfile, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "user_id" })
  user: Relation<User>;

  @ManyToOne(() => Department, (d) => d.staffProfiles, { onDelete: "RESTRICT" })
  @JoinColumn({ name: "department_id" })
  department: Relation<Department>;

  @OneToMany(() => ComplaintAssignment, (a) => a.staffProfile)
  assignments: Relation<ComplaintAssignment>[];
}
