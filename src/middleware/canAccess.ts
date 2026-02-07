import { type NextFunction, type Request, type Response } from 'express'
import createHttpError from 'http-errors'
import type { AuthRequest } from '../types/index.js'

export const canAccess = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const authRequest = req as AuthRequest
        const roleFromToken = authRequest.auth.role

        if (!roles.includes(roleFromToken)) {
            const error = createHttpError(
                403,
                "You don't have enough permissions"
            )

            next(error)
            return
        }
        next()
    }
}
