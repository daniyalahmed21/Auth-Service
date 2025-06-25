import { checkSchema } from 'express-validator'

export default checkSchema({
    //   firstName: {
    //     notEmpty: {
    //       errorMessage: "First name is required",
    //     },
    //     isString: {
    //       errorMessage: "First name must be a string",
    //     },
    //   },
    //   lastName: {
    //     notEmpty: {
    //       errorMessage: "Last name is required",
    //     },
    //     isString: {
    //       errorMessage: "Last name must be a string",
    //     },
    //   },
    email: {
        notEmpty: {
            errorMessage: 'Email is required',
        },
        isEmail: {
            errorMessage: 'Email is not valid',
        },
    },
    password: {
        notEmpty: {
            errorMessage: 'Password is required',
        },
        isString: {
            errorMessage: 'Password must be a string',
        },
        isLength: {
            errorMessage: 'Password must be at least 6 characters long',
            options: { min: 6 },
        },
    },
})
