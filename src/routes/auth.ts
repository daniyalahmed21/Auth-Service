import { Router, type NextFunction, type Request, type Response } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { User } from '../entity/User.js'
import { UserService } from '../services/UserService.js'
import { AppDataSource } from '../data-source.js'
import logger from '../config/logger.js'
import registerValidator from '../validators/registerValidator.js'
import loginValidator from '../validators/loginValidator.js'

const router = Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService, logger)

router.post(
    '/register',
    registerValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
)

router.post(
    '/login',
    loginValidator,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
)

export default router
