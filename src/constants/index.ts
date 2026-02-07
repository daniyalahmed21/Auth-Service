export const ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    MANAGER: 'manager',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

/** Cookie options for auth tokens (HttpOnly, SameSite=Strict) */
export const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'strict' as const,
    accessTokenMaxAge: 15 * 60 * 1000, // 15 minutes
    refreshTokenMaxAge: 24 * 60 * 60 * 1000, // 24 hours
}

export const TOKEN_ISSUER = 'auth-service'
