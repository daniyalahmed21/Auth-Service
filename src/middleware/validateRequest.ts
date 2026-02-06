import type { NextFunction, Request, Response } from 'express'
import { validationResult, type FieldValidationError } from 'express-validator'
import createHttpError from 'http-errors'

export const validateRequest = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const result = validationResult(req)

    if (!result.isEmpty()) {
        const errorArray = result
            .array()
            .filter((err): err is FieldValidationError => err.type === 'field')
            .map((err) => ({
                msg: String(err.msg),
                param: err.path,
            }))

        const error = createHttpError(400, 'Validation Error')
        error.errors = errorArray

        return next(error)
    }

    next()
}
