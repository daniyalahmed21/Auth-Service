import type { Request } from 'express'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: 'admin' | 'customer'
}

export interface registerUserRequest extends Request {
    body: UserData
}
