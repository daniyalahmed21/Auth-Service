import { type Repository, type QueryDeepPartialEntity } from 'typeorm'
import type { User } from '../entity/User.js'
import type { UserData, UserQueryParams } from '../types/index.js'
import bcrypt from 'bcryptjs'
import createHttpError from 'http-errors'

export class UserService {
    constructor(private readonly userRepository: Repository<User>) {}

    async create(userData: UserData) {
        const { firstName, lastName, email, password, role, tenantId } =
            userData

        const existingUser = await this.userRepository.findOne({
            where: { email },
        })

        if (existingUser) {
            throw createHttpError(400, 'Email already registered')
        }

        const saltRounds = 10
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password, salt)

        const user = this.userRepository.create({
            firstName,
            lastName,
            email,
            password: hash,
            role,
            tenant: tenantId ? { id: tenantId } : null,
        })
        await this.userRepository.save(user)
        return user
    }

    async update(userId: number, userData: Partial<UserData>) {
        const { firstName, lastName, role, email, tenantId } = userData

        const updateData: QueryDeepPartialEntity<User> = {}
        if (firstName) updateData.firstName = firstName
        if (lastName) updateData.lastName = lastName
        if (role) updateData.role = role
        if (email) updateData.email = email
        if (tenantId !== undefined) {
            updateData.tenant = tenantId ? { id: tenantId } : null
        }

        return await this.userRepository.update(userId, updateData)
    }

    async getAll(validatedQuery: UserQueryParams) {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .select([
                'user.id',
                'user.firstName',
                'user.lastName',
                'user.email',
                'user.role',
            ])

        if (validatedQuery.q) {
            const searchTerm = `%${validatedQuery.q}%`
            queryBuilder.where(
                "CONCAT(user.firstName, ' ', user.lastName, ' ', user.email) ILike :q",
                { q: searchTerm }
            )
        }

        if (validatedQuery.role) {
            queryBuilder.andWhere('user.role = :role', {
                role: validatedQuery.role,
            })
        }

        const result = await queryBuilder
            .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
            .take(validatedQuery.perPage)
            .orderBy('user.id', 'DESC')
            .getManyAndCount()

        return result
    }

    async findById(id: number) {
        return await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
            },
            relations: {
                tenant: true,
            },
        })
    }

    async deleteById(id: number) {
        return await this.userRepository.delete(id)
    }

    async findByEmail(email: string) {
        return await this.userRepository.findOne({ where: { email } })
    }

    async comparePassword(
        plainPassword: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword)
    }
}
