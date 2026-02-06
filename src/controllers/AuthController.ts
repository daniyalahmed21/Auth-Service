import type { NextFunction, Response } from 'express'
import type { AuthRequest, registerUserRequest } from '../types/index.js'
import type { UserService } from '../services/UserService.js'
import type { TokenService } from '../services/TokenService.js'
import type { Logger } from 'winston'
import { ROLES } from '../constants/index.js'
import createHttpError from 'http-errors'
import type { JwtPayload } from 'jsonwebtoken'

export class AuthController {
    constructor(
        private userService: UserService,
        private tokenService: TokenService,
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
                role: ROLES.CUSTOMER,
            })
            this.logger.info(`User registered with id: ${user.id}`)

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id)
            )

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            })

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            })

            return res.status(201).json({
                message: 'Registration successful',
                id: user.id,
            })
        } catch (error) {
            next(error)
            return
        }
    }

    async login(req: registerUserRequest, res: Response, next: NextFunction) {
        const { email, password } = req.body

        try {
            const user = await this.userService.getUserByEmail(email)
            if (!user) {
                this.logger.warn(`Invalid login attempt for email: ${email}`)
                const error = createHttpError(401, 'Invalid email or password')
                throw error
            }

            const isPasswordValid = await this.userService.comparePassword(
                password,
                user.password
            )

            if (!isPasswordValid) {
                this.logger.warn(`Invalid login attempt for email: ${email}`)
                const error = createHttpError(401, 'Invalid email or password')
                throw error
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)

            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id)
            )

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
            })

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000,
            })

            return res.status(200).json({
                message: 'Login successful',
                id: user.id,
            })
        } catch (error) {
            next(error)
            return
        }
    }

    async getSelf(req: AuthRequest, res: Response) {
        const { sub } = req.Auth

        const user = await this.userService.getUserById(Number(sub))

        return res.status(200).json(user)
    }
}
