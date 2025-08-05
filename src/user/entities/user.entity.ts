import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Role } from '../../roles/entities/role.entity';
import { ClassEnrollment } from '../../classes/entities/class-enrollment.entity';

export enum UserType {
  CLIENT = 'client',
  COACH = 'coach',
  ADMIN = 'admin',
  SPECIALIST = 'specialist' // Nuevo tipo de usuario
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

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: UserType,
    default: UserType.CLIENT
  })
  userType: UserType;

  // 👈 NUEVO: Campos para QR
  @Column({ unique: true, nullable: true })
  qrCode: string; // UUID único para el QR

  @Column({ default: true })
  qrActive: boolean; // Para activar/desactivar el QR

  @Column({ type: 'datetime', nullable: true })
  lastQrScan: Date; // Última vez que se escaneó el QR

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Role, role => role.users, { eager: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' }
  })
  roles: Role[];

  @OneToMany(() => ClassEnrollment, enrollment => enrollment.user)
  enrollments: ClassEnrollment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Método helper para obtener el nombre completo
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
