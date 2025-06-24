import { checkSchema } from 'express-validator'

export default checkSchema({
    email: {
        trim: true,
        notEmpty: {
            errorMessage: 'Email is required',
        },
        isEmail: {
            errorMessage: 'Email is not valid',
        },
        normalizeEmail: true,
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required',
        },
        isString: {
            errorMessage: 'Password must be a string',
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password must be at least 6 characters long',
        },
    },
    firstName: {
        notEmpty: {
            errorMessage: 'First name is required',
        },
        isString: {
            errorMessage: 'First name must be a string',
        },
    },
})
