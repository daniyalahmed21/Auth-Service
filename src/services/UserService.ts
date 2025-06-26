import type { Repository } from 'typeorm'
import type { User } from '../entity/User.js'
import type { UserData } from '../types/index.js'
import bcrypt from 'bcryptjs'
import createHttpError from 'http-errors'

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async createUser(userData: UserData) {
        const { firstName, lastName, email, password, role } = userData

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
        })
        await this.userRepository.save(user)
        return user
    }
}
