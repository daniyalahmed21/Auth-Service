import { validationResult, type FieldValidationError } from 'express-validator'
import type { Request, Response, NextFunction } from 'express'

/**
 * Middleware that runs after express-validator chain.
 * Returns 400 with a consistent error shape if validation failed.
 */
export function validateRequest(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        next()
        return
    }

    const details = errors
        .array()
        .filter((err): err is FieldValidationError => err.type === 'field')
        .map((err) => ({ msg: String(err.msg), param: String(err.path) }))

    res.status(400).json({ errors: [{ msg: 'Validation failed', details }] })
}
