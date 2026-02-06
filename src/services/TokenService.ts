import fs from 'fs'
import path from 'path'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import createHttpError from 'http-errors'
import { Config } from '../config/index.js'
import type { User } from '../entity/User.js'
import { RefreshToken } from '../entity/RefreshToken.js'
import { AppDataSource } from '../data-source.js'

export class TokenService {
    constructor(
        private refreshTokenRepository = AppDataSource.getRepository(
            RefreshToken
        )
    ) {}

    generateAccessToken(payload: JwtPayload): string {
        let privateKey: Buffer
        try {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = path.dirname(__filename)
            privateKey = fs.readFileSync(
                path.resolve(__dirname, '../../certs/private.pem')
            )
        } catch (err) {
            console.error(err)
            const error = createHttpError(500, 'Failed to read private key')
            throw error
        }

        const accessToken = jwt.sign(payload, privateKey, {
            expiresIn: '1h',
            algorithm: 'RS256',
            issuer: 'auth-service',
        })

        return accessToken
    }

    generateRefreshToken(payload: JwtPayload, jwtId: string): string {
        const refreshToken = jwt.sign(payload, Config.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d',
            algorithm: 'HS256',
            issuer: 'auth-service',
            jwtid: jwtId,
        })
        return refreshToken
    }

    async persistRefreshToken(user: User): Promise<RefreshToken> {
        const MS_IN_YEAR = 1000 * 60 * 60 * 24 * 365

        const newRefreshToken = await this.refreshTokenRepository.save({
            user: user,
            expiresAt: new Date(Date.now() + MS_IN_YEAR),
        })
        return newRefreshToken
    }

    async deleteRefreshToken(tokenId: string) {
        await this.refreshTokenRepository.delete({ id: Number(tokenId) })
    }
}
