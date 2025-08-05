import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum AppointmentType {
    PHYSIOTHERAPY = 'physiotherapy',
    ACUPUNCTURE = 'acupuncture',
    MASSAGE = 'massage',
    FACIAL = 'facial',
    CONSULTATION = 'consultation'
}

export enum AppointmentStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show'
}

@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column()
    clientId: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'specialistId' })
    specialist: User;

    @Column()
    specialistId: number;

    @Column({
        type: 'enum',
        enum: AppointmentType
    })
    type: AppointmentType;

    @Column('datetime')
    scheduledDate: Date;

    @Column({ default: 60 })
    duration: number; // en minutos

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: AppointmentStatus,
        default: AppointmentStatus.SCHEDULED
    })
    status: AppointmentStatus;

    @Column('text', { nullable: true })
    notes: string;

    @Column('text', { nullable: true })
    specialistNotes: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}