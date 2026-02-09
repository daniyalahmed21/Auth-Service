import type { Response } from 'express'
import { COOKIE_OPTIONS } from '../constants/index.js'

/**
 * Sets authentication cookies (access_token and refresh_token) on the response
 */
export function setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
): void {
    res.cookie('access_token', accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_OPTIONS.accessTokenMaxAge,
    })
    res.cookie('refresh_token', refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: COOKIE_OPTIONS.refreshTokenMaxAge,
    })
}
