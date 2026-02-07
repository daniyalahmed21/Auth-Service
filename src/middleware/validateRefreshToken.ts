import { expressjwt } from 'express-jwt'
import { Config } from '../config/index.js'
import type { RequestHandler } from 'express'
import { AppDataSource } from '../config/data-source.js'
import logger from '../config/logger.js'
import type { Request } from 'express'
import { RefreshToken } from '../entity/RefreshToken.js'

interface RefreshTokenCookie {
    refresh_token: string
}

export const validateRefreshToken: RequestHandler = expressjwt({
    secret: Config.REFRESH_TOKEN_SECRET,
    algorithms: ['HS256'],
    getToken: (req) => {
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer ')
        ) {
            return req.headers.authorization.split(' ')[1]
        } else if (req.cookies && (req.cookies as RefreshTokenCookie)) {
            const { refresh_token } = req.cookies as RefreshTokenCookie
            return refresh_token
        }
    },

    async isRevoked(req: Request, token): Promise<boolean> {
        try {
            if (!token || !token.payload) return true

            const payload = token.payload as {
                tokenId: number
                sub: string
            }

            const tokenRepo = AppDataSource.getRepository(RefreshToken)

            const refreshToken = await tokenRepo.findOne({
                where: {
                    id: payload.tokenId,
                    user: {
                        id: Number(payload.sub),
                    },
                },
            })

            return !refreshToken
        } catch (error) {
            logger.error(error)
            return true
        }
    },
})
