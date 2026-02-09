import type { Request } from 'express'
import type { Role } from '../constants/index.js'

export interface UserData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: Role
    tenantId?: number | undefined
}

export interface RegisterUserRequest extends Request {
    body: UserData
}

export interface AuthRequest extends Request {
    auth: {
        sub: string
        role: Role
        jti?: string
    }
}

export interface ITenant {
    name: string
    address: string
}

export interface TenantData {
    name: string
    address: string
}

export interface CreateTenantRequest extends Request {
    body: TenantData
}

export interface CreateUserRequest extends Request {
    body: UserData
}

export interface LimitedUserData {
    firstName: string
    lastName: string
    role: Role
    email: string
    tenantId?: number | undefined
}

export interface UpdateUserRequest extends Request {
    body: LimitedUserData
}

export interface UserQueryParams {
    perPage: number
    currentPage: number
    q: string
    role: string
}

export interface TenantQueryParams {
    q: string
    perPage: number
    currentPage: number
}
