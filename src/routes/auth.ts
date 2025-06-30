import { Router } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { User } from '../entity/User.js'
import { UserService } from '../services/UserService.js'
import { AppDataSource } from '../data-source.js'
import logger from '../config/logger.js'

const router = Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService, logger)

router.post('/register', (req, res, next) =>
    authController.register(req, res, next)
)

export default router
