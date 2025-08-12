import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ClassEnrollment } from './class-enrollment.entity';

export enum ClassType {
  YOGA = 'YOGA',
  PILATES = 'PILATES',
  SPINNING = 'SPINNING',
  CROSSFIT = 'CROSSFIT',
  AEROBICOS = 'AEROBICOS',
  FUNCIONAL = 'FUNCIONAL'
}

export enum ClassLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum ClassStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ClassType,
    default: ClassType.FUNCIONAL
  })
  type: ClassType;

  @Column({
    type: 'enum',
    enum: ClassLevel,
    default: ClassLevel.BEGINNER
  })
  level: ClassLevel;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.SCHEDULED
  })
  status: ClassStatus;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ type: 'int', default: 60 })
  duration: number; // ✅ Agregado

  @Column({ name: 'max_enrollments', type: 'int', default: 20 })
  maxEnrollments: number; // ✅ Corregido nombre

  @Column({ name: 'current_enrollments', type: 'int', default: 0 })
  currentEnrollments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({ name: 'coach_id', type: 'int' })
  coachId: number; // ✅ Agregado

  @Column({ type: 'json', nullable: true })
  equipment: string[]; // ✅ Agregado

  @Column({ type: 'text', nullable: true })
  notes: string; // ✅ Agregado

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones
  @ManyToOne(() => User, user => user.classesAsCoach)
  @JoinColumn({ name: 'coach_id' })
  coach: User;

  @OneToMany(() => ClassEnrollment, enrollment => enrollment.class)
  enrollments: ClassEnrollment[];
}