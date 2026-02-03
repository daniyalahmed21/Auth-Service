import type { Repository } from 'typeorm'
import type { User } from '../entity/User.js'
import type { UserData } from '../types/index.js'

export class UserService {
    constructor(private userRepository: Repository<User>) {}

    async createUser(userData: UserData) {
        const user = this.userRepository.create(userData)
        await this.userRepository.save(user)
        return user
    }
}
