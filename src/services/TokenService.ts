import fs from 'fs'
import path from 'path'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { fileURLToPath } from 'url'
import createHttpError from 'http-errors'
import { Config } from '../config/index.js'
import { TOKEN_ISSUER } from '../constants/index.js'
import logger from '../config/logger.js'
import type { User } from '../entity/User.js'
import { RefreshToken } from '../entity/RefreshToken.js'
import { AppDataSource } from '../config/data-source.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../../certs/private.pem')

function loadPrivateKey(): Buffer {
    try {
        return fs.readFileSync(PRIVATE_KEY_PATH)
    } catch (err) {
        logger.error('Failed to read private key', {
            path: PRIVATE_KEY_PATH,
            err,
        })
        throw createHttpError(500, 'Failed to read private key')
    }
}

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
