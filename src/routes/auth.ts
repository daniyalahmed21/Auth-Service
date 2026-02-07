import { Router, type NextFunction, type Request, type Response } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { User } from '../entity/User.js'
import { UserService } from '../services/UserService.js'
import { TokenService } from '../services/TokenService.js'
import logger from '../config/logger.js'
import { validateRequest } from '../middleware/validateRequest.js'
import registerValidator from '../validators/registerValidator.js'
import loginValidator from '../validators/loginValidator.js'
import { authenticate } from '../middleware/authenticate.js'
import type { AuthRequest } from '../types/index.js'
import { AppDataSource } from '../config/data-source.js'
import { validateRefreshToken } from '../middleware/validateRefreshToken.js'
import { parseRefreshToken } from '../middleware/parseRefreshToken.js'

const router = Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const tokenService = new TokenService()
const authController = new AuthController(userService, tokenService, logger)

router.post(
    '/register',
    registerValidator,
    validateRequest,
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
)

router.post(
    '/login',
    loginValidator,
    validateRequest,
    (req: Request, res: Response, next: NextFunction) =>
        authController.login(req, res, next)
)

router.get(
    '/self',
    authenticate,
    (req: Request, res: Response, next: NextFunction) =>
        authController.getSelf(req as AuthRequest, res, next)
)

router.post(
    '/refresh',
    validateRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.refresh(req as AuthRequest, res, next)
)

router.post(
    '/logout',
    authenticate,
    parseRefreshToken,
    (req: Request, res: Response, next: NextFunction) =>
        authController.logout(req as AuthRequest, res, next)
)

export default router
