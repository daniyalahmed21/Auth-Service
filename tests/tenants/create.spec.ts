import { DataSource } from 'typeorm'
import {
    describe,
    beforeAll,
    beforeEach,
    afterAll,
    it,
    expect,
    afterEach,
} from 'vitest'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'
import createJWKSMock from 'mock-jwks'
import { Tenant } from '../../src/entity/Tenant'

describe('POST /tenant', () => {
    let connection: DataSource
    let jwks: ReturnType<typeof createJWKSMock>
    let adminToken: string

    beforeAll(async () => {
        jwks = createJWKSMock('http://localhost:5501')
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        jwks.start()
        await connection.dropDatabase()
        await connection.synchronize()

        adminToken = jwks.token({
            sub: '1',
            role: 'admin',
        })
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
            jwks.stop()
        }
    })

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            const response = await request(app)
                .post('/tenant')
                .set('Cookie', [`access_token=${adminToken}`])
                .send({
                    name: 'Tenant 1',
                    address: 'Address 1',
                })
            expect(response.statusCode).toBe(201)
        })

        it('should return the 403 status code', async () => {
            const data = {
                id: 1,
                role: 'customer',
            }
            const accessToken = jwks.token({
                sub: String(data.id),
                role: data.role,
            })
            const response = await request(app)
                .post('/tenant')
                .set('Cookie', [`access_token=${accessToken}`])
                .send({
                    name: 'Tenant 1',
                    address: 'Address 1',
                })
            expect(response.statusCode).toBe(403)
        })

        it('should create a tenant in the database', async () => {
            const tenantData = {
                name: 'Tenant name',
                address: 'Tenant address',
            }

            await request(app)
                .post('/tenant')
                .set('Cookie', [`access_token=${adminToken}`])
                .send(tenantData)

            const tenantRepository = connection.getRepository(Tenant)
            const tenants = await tenantRepository.find()
            expect(tenants).toHaveLength(1)
            expect(tenants[0].name).toBe(tenantData.name)
            expect(tenants[0].address).toBe(tenantData.address)
        })
    })
})
