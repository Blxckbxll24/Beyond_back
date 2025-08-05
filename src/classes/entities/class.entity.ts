import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ClassEnrollment } from './class-enrollment.entity';

export enum ClassStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum ClassLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  ALL_LEVELS = 'all_levels'
}

export enum ClassType {
  MAT_PILATES = 'mat_pilates',
  REFORMER = 'reformer',
  CADILLAC = 'cadillac',
  CHAIR = 'chair',
  BARREL = 'barrel',
  PRENATAL = 'prenatal',
  REHABILITATION = 'rehabilitation'
}

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ClassType,
    default: ClassType.MAT_PILATES
  })
  type: ClassType;

  @Column({
    type: 'enum',
    enum: ClassLevel,
    default: ClassLevel.ALL_LEVELS
  })
  level: ClassLevel;

  @Column({ type: 'datetime' })
  startTime: Date;

  @Column({ type: 'datetime' })
  endTime: Date;

  @Column({ default: 8 })
  maxCapacity: number;

  @Column({ default: 0 })
  currentEnrollments: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ClassStatus,
    default: ClassStatus.SCHEDULED
  })
  status: ClassStatus;

  @Column({ nullable: true })
  room: string;

  @Column({ type: 'text', nullable: true })
  equipment: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  isActive: boolean;

  // Relación con el instructor (coach) - CORREGIDO
  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'instructorId' })
  instructor: User;

  @Column({ name: 'instructorId' })
  instructorId: number;

  // Alias para compatibilidad con el código existente
  get coach(): User {
    return this.instructor;
  }

  get coachId(): number {
    return this.instructorId;
  }

  // Relación con inscripciones
  @OneToMany(() => ClassEnrollment, enrollment => enrollment.class)
  enrollments: ClassEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}