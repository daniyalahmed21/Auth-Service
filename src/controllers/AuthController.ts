import path from 'path'
import fs from 'fs'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import type { NextFunction, Response } from 'express'
import type { registerUserRequest } from '../types/index.js'
import type { UserService } from '../services/UserService.js'
import type { Logger } from 'winston'
import { ROLES } from '../constants/index.js'
import { validationResult } from 'express-validator'
import createHttpError from 'http-errors'
import { fileURLToPath } from 'url'
import { Config } from '../config/index.js'
import { AppDataSource } from '../data-source.js'
import { RefreshToken } from '../entity/RefreshToken.js'

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
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            this.logger.error('Validation errors:', errors.array())
            return res.status(400).json({ errors: errors.array() })
        }

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

            let privateKey: Buffer

            try {
                const __filename = fileURLToPath(import.meta.url)
                const __dirname = path.dirname(__filename)
                privateKey = fs.readFileSync(
                    path.resolve(__dirname, '../../certs/private.pem')
                )
            } catch (err) {
                this.logger.error('Error reading private key:', err)
                const error = createHttpError(500, 'Failed to read private key')
                next(error)
                return
            }

            const accessToken = jwt.sign(payload, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
                issuer: 'auth-service',
            })

            //persistent refresh token

            const refreshTokenRepository =
                AppDataSource.getRepository(RefreshToken)

            const newRefreshToken = await refreshTokenRepository.save({
                user: user,
                expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            })
            const refreshToken = jwt.sign(
                payload,
                Config.REFRESH_TOKEN_SECRET,
                {
                    expiresIn: '1d',
                    algorithm: 'HS256',
                    issuer: 'auth-service',
                    jwtid: String(newRefreshToken.id),
                }
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
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            this.logger.error('Validation errors:', errors.array())
            return res.status(400).json({ errors: errors.array() })
        }

        const { email, password } = req.body

        try {
            const user = await this.userService.getUserByEmail(email)
            if (!user) {
                this.logger.warn(`Invalid login attempt for email: ${email}`)
                const error = createHttpError(401, 'Invalid email or password')
                next(error)
                return
            }

            const isPasswordValid = await this.userService.comparePassword(
                password,
                user.password
            )

            if (!isPasswordValid) {
                this.logger.warn(`Invalid login attempt for email: ${email}`)
                const error = createHttpError(401, 'Invalid email or password')
                next(error)
                return
            }

            const payload: JwtPayload = {
                sub: String(user.id),
                role: user.role,
            }

            let privateKey: Buffer

            try {
                const __filename = fileURLToPath(import.meta.url)
                const __dirname = path.dirname(__filename)
                privateKey = fs.readFileSync(
                    path.resolve(__dirname, '../../certs/private.pem')
                )
            } catch (err) {
                this.logger.error('Error reading private key:', err)
                const error = createHttpError(500, 'Failed to read private key')
                next(error)
                return
            }

            const accessToken = jwt.sign(payload, privateKey, {
                expiresIn: '1h',
                algorithm: 'RS256',
                issuer: 'auth-service',
            })

            res.cookie('access_token', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000,
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
}
