import jwt, { type JwtPayload } from 'jsonwebtoken'
import { Config } from '../config/index.js'
import { TOKEN_ISSUER } from '../constants/index.js'
import type { User } from '../entity/User.js'
import { RefreshToken } from '../entity/RefreshToken.js'
import { AppDataSource } from '../config/data-source.js'
import { loadPrivateKey } from '../utils/index.js'

export class TokenService {
    private privateKey: Buffer | null = null

    constructor(
        private refreshTokenRepository = AppDataSource.getRepository(
            RefreshToken
        )
    ) {}

    private getPrivateKey(): Buffer {
        if (!this.privateKey) {
            this.privateKey = loadPrivateKey()
        }
        return this.privateKey
    }

    generateAccessToken(payload: JwtPayload): string {
        return jwt.sign(payload, this.getPrivateKey(), {
            expiresIn: '1h',
            algorithm: 'RS256',
            issuer: TOKEN_ISSUER,
        })
    }

    generateRefreshToken(payload: JwtPayload, jwtId: string): string {
        return jwt.sign(payload, Config.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d',
            algorithm: 'HS256',
            issuer: TOKEN_ISSUER,
            jwtid: jwtId,
        })
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
