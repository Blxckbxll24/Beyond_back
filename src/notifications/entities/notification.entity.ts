import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

export enum NotificationType {
    CLASS_REMINDER = 'class_reminder',
    APPOINTMENT_REMINDER = 'appointment_reminder',
    PAYMENT_CONFIRMATION = 'payment_confirmation',
    PROMOTIONAL = 'promotional',
    SYSTEM = 'system'
}

export enum NotificationStatus {
    UNREAD = 'unread',
    READ = 'read'
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column()
    title: string;

    @Column('text')
    message: string;

    @Column({ nullable: true })
    relatedId: number; // ID relacionado (clase, cita, etc.)

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.UNREAD
    })
    status: NotificationStatus;

    @Column('datetime', { nullable: true })
    readAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}