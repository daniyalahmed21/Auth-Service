import { expressjwt } from 'express-jwt'
import jwksRsa from 'jwks-rsa'
import { Config } from '../config/index.js'
import type { RequestHandler } from 'express'

interface AuthToken {
    accessToken: string
}

const jwksSecret = jwksRsa.expressJwtSecret({
    jwksUri: Config.JWKS_URI,
    cache: true,
    rateLimit: true,
})

export const authenticate: RequestHandler = expressjwt({
    secret: jwksSecret,
    algorithms: ['RS256'],
    getToken: (req) => {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            return req.headers.authorization.split(' ')[1]
        } else if (req.cookies && (req.cookies as AuthToken)) {
            const { accessToken } = req.cookies as AuthToken
            return accessToken
        }
    },
})
