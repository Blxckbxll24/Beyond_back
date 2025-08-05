import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Class } from "./class.entity";

export enum EnrollmentStatus {
    ENROLLED = 'enrolled',
    ATTENDED = 'attended',
    MISSED = 'missed',
    CANCELLED = 'cancelled'
}

@Entity('class_enrollments')
export class ClassEnrollment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Class, cls => cls.enrollments, { nullable: false })
    @JoinColumn({ name: 'classId' })
    class: Class;

    @Column()
    classId: number;

    @Column({
        type: 'enum',
        enum: EnrollmentStatus,
        default: EnrollmentStatus.ENROLLED
    })
    status: EnrollmentStatus;

    @Column('datetime')
    enrollmentDate: Date;

    @Column('datetime', { nullable: true })
    attendanceDate: Date;

    @Column({ nullable: true }) // 👈 CORREGIDO: nullable: true permite undefined
    notes?: string; // 👈 CORREGIDO: opcional con ?

    @CreateDateColumn()
    createdAt: Date;
}