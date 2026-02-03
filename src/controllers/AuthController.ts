import type { Response } from 'express'
import type { registerUserRequest } from '../types/index.js'
import type { UserService } from '../services/UserService.js'

export class AuthController {
    constructor(private userService: UserService) {}

    async register(req: registerUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body

        const user = await this.userService.createUser({
            firstName,
            lastName,
            email,
            password,
        })

        res.status(201).json({
            message: 'Registration successful',
            id: user.id,
        })
    }
}
