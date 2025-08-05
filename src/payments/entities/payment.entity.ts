import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum PaymentStatus {
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum PaymentType {
    CLASS = 'class',
    APPOINTMENT = 'appointment',
    PRODUCT = 'product',
    PACKAGE = 'package'
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column('decimal', { precision: 10, scale: 2 })
    amount: number;

    @Column({
        type: 'enum',
        enum: PaymentType
    })
    type: PaymentType;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ nullable: true })
    referenceId: number; // ID del item comprado (clase, cita, producto)

    @Column({ nullable: true })
    transactionId: string; // ID de la pasarela de pago

    @Column('datetime')
    transactionDate: Date;

    @Column('datetime', { nullable: true })
    confirmedAt: Date;

    @Column('text', { nullable: true })
    notes: string;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}