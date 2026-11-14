import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { Department } from '../../department/entities/department.entity.js';
import { Complaint } from '../../complaints/entities/complaint.entity.js';
import { Priority } from '../../common/enums/priority.enum.js';

@Entity('categories')
@Unique('uq_category_department_name', ['departmentId', 'name'])
export class Category {
  @PrimaryGeneratedColumn()
  categoryId: number;

  @Column({ name: 'department_id' })
  departmentId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: Priority, default: Priority.MEDIUM })
  defaultPriority: Priority;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Department, (department) => department.categories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'department_id', referencedColumnName: 'departmentId' })
  department: Department;

  @OneToMany(() => Complaint, (complaint) => complaint.category)
  complaints: Complaint[];
}
