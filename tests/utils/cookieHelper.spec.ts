import { describe, it, expect, vi } from 'vitest'
import type { Response } from 'express'
import { setAuthCookies } from '../../src/utils/cookieHelper.js'
import { COOKIE_OPTIONS } from '../../src/constants/index.js'

describe('setAuthCookies', () => {
    it('should set access_token and refresh_token cookies with correct options', () => {
        const mockResponse = {
            cookie: vi.fn(),
        } as unknown as Response

        const accessToken = 'test-access-token'
        const refreshToken = 'test-refresh-token'

        setAuthCookies(mockResponse, accessToken, refreshToken)

        expect(mockResponse.cookie).toHaveBeenCalledTimes(2)
        expect(mockResponse.cookie).toHaveBeenCalledWith(
            'access_token',
            accessToken,
            {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.accessTokenMaxAge,
            }
        )
        expect(mockResponse.cookie).toHaveBeenCalledWith(
            'refresh_token',
            refreshToken,
            {
                ...COOKIE_OPTIONS,
                maxAge: COOKIE_OPTIONS.refreshTokenMaxAge,
            }
        )
    })
})
