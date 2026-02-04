import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        isEmail: {
            errorMessage: 'Email is not valid',
        },
        trim: true,
        notEmpty: {
            errorMessage: 'Email is required',
        },
        normalizeEmail: true,
    },
    password: {
        trim: true,
        notEmpty: {
            errorMessage: 'Password is required',
        },
    },
})
