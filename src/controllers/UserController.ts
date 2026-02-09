import type { NextFunction, Request, Response } from 'express'
import { UserService } from '../services/UserService.js'
import type {
    CreateUserRequest,
    UpdateUserRequest,
    UserQueryParams,
} from '../types/index.js'
import createHttpError from 'http-errors'
import type { Logger } from 'winston'
import { matchedData } from 'express-validator'
import { validateNumericId } from '../utils/validationHelper.js'

export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly logger: Logger
    ) {}

    async create(req: CreateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, email, password, tenantId, role } =
            req.body
        try {
            const user = await this.userService.create({
                firstName,
                lastName,
                email,
                password,
                role,
                tenantId,
            })
            res.status(201).json({ id: user.id })
        } catch (err) {
            next(err)
        }
    }

    async update(req: UpdateUserRequest, res: Response, next: NextFunction) {
        const { firstName, lastName, role, email, tenantId } = req.body

        try {
            const userId = validateNumericId(req.params.id)

            this.logger.debug('Request for updating a user', req.body)

            await this.userService.update(userId, {
                firstName,
                lastName,
                role,
                email,
                tenantId,
            })

            this.logger.info('User has been updated', { id: userId })

            res.json({ id: userId })
        } catch (err) {
            next(err)
        }
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const validatedQuery = matchedData(req, { onlyValidData: true })

        try {
            const [users, count] = await this.userService.getAll(
                validatedQuery as UserQueryParams
            )

            this.logger.info('All users have been fetched')
            res.json({
                currentPage: validatedQuery.currentPage as number,
                perPage: validatedQuery.perPage as number,
                total: count,
                data: users,
            })
        } catch (err) {
            next(err)
        }
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = validateNumericId(req.params.id)
            const user = await this.userService.findById(userId)

            if (!user) {
                next(createHttpError(400, 'User does not exist.'))
                return
            }

            this.logger.info('User has been fetched', { id: user.id })
            res.json(user)
        } catch (err) {
            next(err)
        }
    }

    async destroy(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = validateNumericId(req.params.id)
            await this.userService.deleteById(userId)

            this.logger.info('User has been deleted', { id: userId })
            res.json({ id: userId })
        } catch (err) {
            next(err)
        }
    }
}
