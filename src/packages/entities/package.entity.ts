import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { UserPackage } from "./user-package.entity";

export enum PackageType {
    CLASS_PACKAGE = 'class_package',
    UNLIMITED_MONTHLY = 'unlimited_monthly',
    UNLIMITED_ANNUAL = 'unlimited_annual',
    SPECIALTY_PACKAGE = 'specialty_package'
}

@Entity('packages')
export class Package {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: PackageType
    })
    type: PackageType;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({ nullable: true })
    classCount: number; // Para paquetes de clases

    @Column({ default: 30 })
    validityDays: number; // Días de validez

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @OneToMany(() => UserPackage, userPackage => userPackage.package)
    userPackages: UserPackage[];
}