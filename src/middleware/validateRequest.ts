import { validationResult, type FieldValidationError } from 'express-validator'
import type { Request, Response, NextFunction } from 'express'

export const validateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: [
                {
                    details: errors
                        .array()
                        .filter(
                            (err): err is FieldValidationError =>
                                err.type === 'field'
                        )
                        .map((err) => ({
                            msg: String(err.msg),
                            param: String(err.path),
                        })),
                },
            ],
        })
    }

    next()
}
