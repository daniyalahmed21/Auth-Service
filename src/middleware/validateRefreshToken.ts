import { expressjwt } from 'express-jwt'
import { Config } from '../config/index.js'
import type { RequestHandler, Request } from 'express'
import { AppDataSource } from '../config/data-source.js'
import logger from '../config/logger.js'
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
        } else if (req.cookies?.refresh_token) {
            return (req.cookies as RefreshTokenCookie).refresh_token
        }
    },

    async isRevoked(req: Request, token): Promise<boolean> {
        try {
            if (!token?.payload) return true

            const payload = token.payload as { jti?: string; sub?: string }
            const tokenId = payload.jti
            const userId = payload.sub

            if (!tokenId || !userId) return true

            const tokenRepo = AppDataSource.getRepository(RefreshToken)
            const refreshToken = await tokenRepo.findOne({
                where: {
                    id: Number(tokenId),
                    user: { id: Number(userId) },
                },
            })

            return !refreshToken
        } catch (error) {
            logger.error(error)
            return true
        }
    },
})
