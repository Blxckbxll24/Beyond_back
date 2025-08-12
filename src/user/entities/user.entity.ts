import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { ClassEnrollment } from '../../classes/entities/class-enrollment.entity';
import { Class } from '../../classes/entities/class.entity';

export enum UserType {
  ADMIN = 'admin',
  COACH = 'coach',
  CLIENT = 'client',
  SPECIALIST = 'specialist'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CLIENT
  })
  userType: UserType;

  // ✅ ARREGLAR: Usar string en lugar de Date para mayor compatibilidad
  @Column({ nullable: true, length: 10 }) // YYYY-MM-DD
  dateOfBirth: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  qrCode: string;

  @Column({ default: false })
  qrActive: boolean;

  @Column({ nullable: true })
  lastQrScan: Date;

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' }
  })
  roles: Role[];

  @OneToMany(() => ClassEnrollment, enrollment => enrollment.user)
  enrollments: ClassEnrollment[];

  @OneToMany(() => Class, classEntity => classEntity.coach)
  classesAsCoach: Class[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método helper para obtener el nombre completo
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
