import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { ComplaintStatus } from '../../complaints/enums/complaint-status.enum.js';
import type { Complaint } from '../../complaints/entities/complaint.entity.js';
import type { User } from '../../users/entities/user.entity.js';
@Entity('complaint_history')
@Index(['complaintId', 'changedAt'])

export class ComplaintHistory {
    @PrimaryGeneratedColumn()
    historyId: number;
    @Column({ name: 'complaint_id' })
    complaintId: number;
    @Column({ name: 'changed_by_id' })
    changedById: number;
    @Column({ type: 'enum', enum: ComplaintStatus, nullable: true })
    oldStatus: ComplaintStatus | null;
    @Column({ type: 'enum', enum: ComplaintStatus })
    newStatus: ComplaintStatus;
    @Column({ type: 'text', nullable: true })
    remarks: string | null;
    @CreateDateColumn({ type: 'timestamptz' })
    changedAt: Date;
    @ManyToOne('Complaint', (complaint: Complaint) => complaint.history, {
        onDelete: 'RESTRICT',
    })
    @JoinColumn({ name: 'complaint_id' })
    complaint: Complaint;
    @ManyToOne('User', { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'changed_by_id' })
    changedBy: User;
}
