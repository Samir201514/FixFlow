import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { StaffProfile } from '../../staff-profile/entities/staff-profile.entity.js';
import { Complaint } from '../../complaints/entities/complaint.entity.js';
import { Notification } from '../../notifications/entities/notification.entity.js';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 200, select: false })
  @Exclude()
  password: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ default: 'user' })
  role: string; // will be Role Type using Enum

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date;

  // @OneToOne('staff-profile', (staffProfile: StaffProfile) => {
  //   staffProfile.user;
  // })
  // staffProfile: StaffProfile;

  // @OneToMany('complaint', (complaint: Complaint) => {
  //   complaint.user;
  // })
  // complaint: Complaint;

  // @OneToMany('notification', (notification: Notification) => {
  //   notification.user;
  // })
  // notification: Notification;
}
