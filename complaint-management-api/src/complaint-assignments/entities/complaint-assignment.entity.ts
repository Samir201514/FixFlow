import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { AssignmentStatus } from '../enums/assignment-status.enum.js';
import type { Complaint } from '../../complaints/entities/complaint.entity.js';
import type { StaffProfile } from '../../staff-profile/entities/staff-profile.entity.js';
import type { User } from '../../users/entities/user.entity.js';

@Entity('complaint_assignments')
@Index('uq_one_active_assignment', ['complaintId'], {
    unique: true,
    where: `"status" IN ('ACTIVE', 'ACCEPTED')`,
})
export class ComplaintAssignment {
    @PrimaryGeneratedColumn()
    assignmentId: number;
    @Column({ name: 'complaint_id' })
    complaintId: number;
    @Column({ name: 'staff_profile_id' })
    staffProfileId: number;
    @Column({ name: 'assigned_by_id' })
    assignedById: number;
    @Column({
        type: 'enum',
        enum: AssignmentStatus,
        default: AssignmentStatus.ACTIVE,
    })
    status: AssignmentStatus;
    @Column({ type: 'text', nullable: true })
    assignmentNote: string | null;
    @Column({ type: 'text', nullable: true })
    rejectionReason: string | null;
    @Column({ type: 'text', nullable: true })
    resolutionNote: string | null;
    @CreateDateColumn({ type: 'timestamptz' })
    assignedAt: Date;
    @Column({ type: 'timestamptz', nullable: true })
    respondedAt: Date | null;
    @Column({ type: 'timestamptz', nullable: true })
    completedAt: Date | null;
    @Column({ type: 'timestamptz', nullable: true })
    unassignedAt: Date | null;
    @ManyToOne('Complaint', (c: Complaint) => c.assignments, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'complaint_id' })
    complaint: Complaint;
    @ManyToOne('StaffProfile', (s: StaffProfile) => s.assignments, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'staff_profile_id' })
    staffProfile: StaffProfile;
    @ManyToOne('User', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'assigned_by_id' })
    assignedBy: User;
}
