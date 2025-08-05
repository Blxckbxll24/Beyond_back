import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { SpaBooking } from "./spa-booking.entity";

export enum SpaServiceCategory {
    MASSAGE = 'massage',
    FACIAL = 'facial',
    BODY_TREATMENT = 'body_treatment',
    RELAXATION = 'relaxation'
}

@Entity('spa_services')
export class SpaService {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: SpaServiceCategory
    })
    category: SpaServiceCategory;

    @Column({ default: 60 })
    duration: number; // en minutos

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => SpaBooking, booking => booking.service)
    bookings: SpaBooking[];
}