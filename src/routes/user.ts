import express from 'express'
import { AppDataSource } from '../config/data-source.js'
import { User } from '../entity/User.js'
import { UserService } from '../services/UserService.js'
import { UserController } from '../controllers/UserController.js'
import logger from '../config/logger.js'
import type { NextFunction, RequestHandler } from 'express'
import { authenticate } from '../middleware/authenticate.js'
import { canAccess } from '../middleware/canAccess.js'
import { ROLES } from '../constants/index.js'
import createUserValidator from '../validators/createUserValidator.js'
import type { CreateUserRequest, UpdateUserRequest } from '../types/index.js'
import updateUserValidator from '../validators/updateUserValidator.js'
import listUserValidator from '../validators/listUserValidator.js'
import { validateRequest } from '../middleware/validateRequest.js'
import type { Request, Response } from 'express'

const router = express.Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const userController = new UserController(userService, logger)

router.post(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    createUserValidator,
    validateRequest,
    (req: CreateUserRequest, res: Response, next: NextFunction) =>
        userController.create(req, res, next) as unknown as RequestHandler
)

router.patch(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    updateUserValidator,
    validateRequest,
    (req: UpdateUserRequest, res: Response, next: NextFunction) =>
        userController.update(req, res, next) as unknown as RequestHandler
)

router.get(
    '/',
    authenticate,
    canAccess([ROLES.ADMIN]),
    listUserValidator,
    validateRequest,
    (req: Request, res: Response, next: NextFunction) =>
        userController.getAll(req, res, next) as unknown as RequestHandler
)

router.get(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req, res, next) =>
        userController.getOne(req, res, next) as unknown as RequestHandler
)

router.delete(
    '/:id',
    authenticate,
    canAccess([ROLES.ADMIN]),
    (req, res, next) =>
        userController.destroy(req, res, next) as unknown as RequestHandler
)

export default router
