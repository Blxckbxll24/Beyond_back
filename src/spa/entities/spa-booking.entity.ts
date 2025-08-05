import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { SpaService } from "./spa-service.entity";

export enum SpaBookingStatus {
    SCHEDULED = 'scheduled',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show'
}

@Entity('spa_bookings')
export class SpaBooking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'clientId' })
    client: User;

    @Column()
    clientId: number;

    @ManyToOne(() => SpaService, service => service.bookings, { nullable: false })
    @JoinColumn({ name: 'serviceId' })
    service: SpaService;

    @Column()
    serviceId: number;

    @Column('datetime')
    scheduledDate: Date;

    @Column({
        type: 'enum',
        enum: SpaBookingStatus,
        default: SpaBookingStatus.SCHEDULED
    })
    status: SpaBookingStatus;

    @Column('text', { nullable: true })
    notes: string;

    @Column('text', { nullable: true })
    therapistNotes: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}