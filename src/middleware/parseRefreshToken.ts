import { expressjwt } from 'express-jwt'
import { Config } from '../config/index.js'
import type { RequestHandler } from 'express'

interface RefreshTokenCookie {
    refresh_token: string
}

export const parseRefreshToken: RequestHandler = expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET,
    algorithms: ['HS256'],
    getToken: (req) => {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            return req.headers.authorization.split(' ')[1]
        } else if (req.cookies?.refresh_token) {
            return (req.cookies as RefreshTokenCookie).refresh_token
        }
    },
})
