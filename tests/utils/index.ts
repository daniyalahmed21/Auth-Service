import { Repository } from 'typeorm'
import { Tenant } from '../../src/entity/Tenant'

export const isJWT = (token: string): boolean => {
    const parts = token.split('.')
    if (parts.length !== 3) return false

    try {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString())

        return header.typ === 'JWT' && ['HS256', 'RS256'].includes(header.alg)
    } catch {
        return false
    }
}

export const extractToken = (cookie: string) =>
    cookie.split(';')[0].split('=')[1]

export const createTenant = async (repository: Repository<Tenant>) => {
    const tenant = await repository.save({
        name: 'Test tenant',
        address: 'Test address',
    })
    return tenant
}
