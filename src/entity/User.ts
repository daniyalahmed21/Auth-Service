import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { ROLES, type Role } from '../constants/index.js'
import { Tenant } from './Tenant.js'

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar')
    firstName: string

    @Column('varchar')
    lastName: string

    @Column('varchar', { unique: true })
    email: string

    @Column('varchar')
    password: string

    @Column({
        type: 'enum',
        enum: ROLES,
        default: ROLES.CUSTOMER,
    })
    role: Role

    @ManyToOne(() => Tenant)
    tenant: Tenant | null
}
