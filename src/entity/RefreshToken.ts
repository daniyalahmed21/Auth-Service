import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { User } from './User.js'

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'timestamp' })
    expiresAt: Date

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

    @ManyToOne(() => User)
    user: User
}
