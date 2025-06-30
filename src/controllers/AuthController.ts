import type { NextFunction, Response } from 'express'
import type { registerUserRequest } from '../types/index.js'
import type { UserService } from '../services/UserService.js'
import type { Logger } from 'winston'

export class AuthController {
    constructor(
        private userService: UserService,
        private logger: Logger
    ) {}

    async register(
        req: registerUserRequest,
        res: Response,
        next: NextFunction
    ) {
        const { firstName, lastName, email, password } = req.body
        this.logger.debug(`Registering user with email: ${email}`)
        try {
            const user = await this.userService.createUser({
                firstName,
                lastName,
                email,
                password,
            })
            this.logger.info(`User registered with id: ${user.id}`)
            return res.status(201).json({
                message: 'Registration successful',
                id: user.id,
            })
        } catch (error) {
            next(error)
            return
        }
    }
}
