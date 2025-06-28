import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ROLES, type Role } from '../constants/index.js'

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column('varchar')
    firstName: string

    @Column('varchar')
    lastName: string

    @Column('varchar')
    email: string

    @Column('varchar')
    password: string

    @Column({
        type: 'enum',
        enum: ROLES,
        default: ROLES.CUSTOMER,
    })
    role: Role
}
