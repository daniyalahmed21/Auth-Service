import type { Request } from 'express'
import type { Role } from '../constants/index.js'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: Role
}

export interface registerUserRequest extends Request {
    body: UserData
}

export interface AuthRequest extends Request {
    Auth: {
        sub: string
        role: Role
    }
}
