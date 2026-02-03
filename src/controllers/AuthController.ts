import type { Request, Response } from 'express'
import { AppDataSource } from '../data-source.js'

interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
}

interface registerUserRequest extends Request {
    body: UserData
}

export class AuthController {
    async register(req: registerUserRequest, res: Response) {
        const { firstName, lastName, email, password } = req.body

        await AppDataSource.getRepository('User').save({
            firstName,
            lastName,
            email,
            password,
        })
        res.status(201).json({ message: 'Registration successful' })
    }
}
