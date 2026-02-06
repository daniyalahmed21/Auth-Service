import type { Request, Response } from 'express'
import type { HttpError } from 'http-errors'
import logger from '../config/logger.js'

interface AppError extends HttpError {
    id?: string
    errors?: unknown
}

export const globalErrorHandler = (
    err: AppError,
    req: Request,
    res: Response
) => {
    const statusCode = err.statusCode ?? 500
    const isProduction = process.env.NODE_ENV === 'production'

    if (statusCode === 500) {
        logger.error(err.message, {
            stack: err.stack,
            method: req.method,
            path: req.path,
        })
    } else {
        logger.warn(err.message, {
            method: req.method,
            path: req.path,
            errors: err.errors,
        })
    }

    res.status(statusCode).json({
        errors: [
            {
                ref: err.id,
                type: err.name,
                msg: err.message,
                path: req.path,
                location: isProduction ? undefined : 'server',
                stack: isProduction ? undefined : err.stack,
                details: err.errors,
            },
        ],
    })
}
