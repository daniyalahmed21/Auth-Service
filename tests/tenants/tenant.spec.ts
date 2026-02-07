import { DataSource } from 'typeorm'
import request from 'supertest'
import createJWKSMock from 'mock-jwks'
import {
    describe,
    beforeAll,
    beforeEach,
    afterEach,
    afterAll,
    it,
    expect,
} from 'vitest'
import app from '../../src/app'
import { Tenant } from '../../src/entity/Tenant'
import { AppDataSource } from '../../src/config/data-source'
import { ROLES } from '../../src/constants'

describe('Tenant CRUD operations', () => {
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
            role: ROLES.ADMIN,
        })
    })

    afterEach(() => {
        jwks.stop()
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
        }
    })

    describe('GET /tenant', () => {
        it('should return a list of tenants', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            await tenantRepository.save([
                { name: 'Tenant 1', address: 'Address 1' },
                { name: 'Tenant 2', address: 'Address 2' },
            ])

            const response = await request(app).get('/tenant').send()

            expect(response.statusCode).toBe(200)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.total).toBe(2)
        })
    })

    describe('GET /tenant/:id', () => {
        it('should return a single tenant', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Single Tenant',
                address: 'Some Address',
            })

            const response = await request(app)
                .get(`/tenant/${tenant.id}`)
                .set('Cookie', [`access_token=${adminToken}`])
                .send()

            expect(response.statusCode).toBe(200)
            expect(response.body.name).toBe(tenant.name)
        })

        it('should return 400 if tenant does not exist', async () => {
            const response = await request(app)
                .get('/tenant/999')
                .set('Cookie', [`access_token=${adminToken}`])
                .send()

            expect(response.statusCode).toBe(400)
            expect(response.body.errors[0].msg).toBe('Tenant does not exist.')
        })
    })

    describe('PATCH /tenant/:id', () => {
        it('should update tenant details', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Old Name',
                address: 'Old Address',
            })

            const updateData = {
                name: 'New Name',
                address: 'New Address',
            }

            const response = await request(app)
                .patch(`/tenant/${tenant.id}`)
                .set('Cookie', [`access_token=${adminToken}`])
                .send(updateData)

            expect(response.statusCode).toBe(200)

            const updatedTenant = await tenantRepository.findOne({
                where: { id: tenant.id },
            })
            expect(updatedTenant?.name).toBe(updateData.name)
            expect(updatedTenant?.address).toBe(updateData.address)
        })
    })

    describe('DELETE /tenant/:id', () => {
        it('should delete a tenant', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'To Delete',
                address: 'Address',
            })

            const response = await request(app)
                .delete(`/tenant/${tenant.id}`)
                .set('Cookie', [`access_token=${adminToken}`])
                .send()

            expect(response.statusCode).toBe(200)

            const deletedTenant = await tenantRepository.findOne({
                where: { id: tenant.id },
            })
            expect(deletedTenant).toBeNull()
        })
    })
})
