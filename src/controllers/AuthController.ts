import type { NextFunction, Response } from 'express'
import type { AuthRequest, registerUserRequest } from '../types/index.js'
import type { UserService } from '../services/UserService.js'
import type { TokenService } from '../services/TokenService.js'
import type { Logger } from 'winston'
import { ROLES, COOKIE_OPTIONS } from '../constants/index.js'
import createHttpError from 'http-errors'
import type { JwtPayload } from 'jsonwebtoken'

export class AuthController {
    constructor(
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly logger: Logger
    ) {}

    async register(
        req: registerUserRequest,
        res: Response,
        next: NextFunction
    ) {
        const { firstName, lastName, email, password } = req.body

        this.logger.debug(`Registering user with email: ${email}`)

        try {
            const user = await this.userService.create({
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
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.accessTokenMaxAge,
            })
            res.cookie('refresh_token', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.refreshTokenMaxAge,
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
            const user = await this.userService.findByEmail(email)
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
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.accessTokenMaxAge,
            })
            res.cookie('refresh_token', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.refreshTokenMaxAge,
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

    async getSelf(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { sub } = req.auth

            const user = await this.userService.findById(Number(sub))

            if (!user) {
                return next(createHttpError(404, 'User not found'))
            }

            return res.status(200).json({
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
            })
        } catch (error) {
            next(error)
            return
        }
    }

    async refresh(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { sub } = req.auth

            const user = await this.userService.findById(Number(sub))

            if (!user) {
                const error = createHttpError(401, 'User not found')
                next(error)
                return
            }

            const payload: JwtPayload = {
                sub: req.auth.sub,
                role: req.auth.role,
            }

            const accessToken = this.tokenService.generateAccessToken(payload)

            const tokenId = req.auth.jti
            if (tokenId) {
                await this.tokenService.deleteRefreshToken(tokenId)
            }
            const newRefreshToken =
                await this.tokenService.persistRefreshToken(user)
            const refreshToken = this.tokenService.generateRefreshToken(
                payload,
                String(newRefreshToken.id)
            )

            res.cookie('access_token', accessToken, {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.accessTokenMaxAge,
            })
            res.cookie('refresh_token', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.refreshTokenMaxAge,
            })

            return res.status(200).json({ id: user.id })
        } catch (error) {
            next(error)
            return
        }
    }

    async logout(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const tokenId = req.auth.jti
            if (tokenId) {
                await this.tokenService.deleteRefreshToken(tokenId)
            }

            res.clearCookie('access_token')
            res.clearCookie('refresh_token')

            return res.status(200).json({ message: 'Logout successful' })
        } catch (error) {
            next(error)
            return
        }
    }
}
