import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";
import { Package } from "./package.entity";

export enum UserPackageStatus {
    ACTIVE = 'active',
    EXPIRED = 'expired',
    USED = 'used',
    CANCELLED = 'cancelled'
}

@Entity('user_packages')
export class UserPackage {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, { nullable: false })
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Package, pkg => pkg.userPackages, { nullable: false })
    @JoinColumn({ name: 'packageId' })
    package: Package;

    @Column()
    packageId: number;

    @Column('datetime')
    purchaseDate: Date;

    @Column('datetime')
    expiryDate: Date;

    @Column({ default: 0 })
    classesUsed: number;

    @Column({
        type: 'enum',
        enum: UserPackageStatus,
        default: UserPackageStatus.ACTIVE
    })
    status: UserPackageStatus;

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;
}