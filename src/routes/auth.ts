import { Router } from 'express'
import { AuthController } from '../controllers/AuthController.js'
import { User } from '../entity/User.js'
import { UserService } from '../services/UserService.js'
import { AppDataSource } from '../data-source.js'

const router = Router()

const userRepository = AppDataSource.getRepository(User)
const userService = new UserService(userRepository)
const authController = new AuthController(userService)

router.post('/register', (req, res) => authController.register(req, res))

export default router
