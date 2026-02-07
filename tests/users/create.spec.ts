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
import { User } from '../../src/entity/User'
import { Tenant } from '../../src/entity/Tenant'
import { AppDataSource } from '../../src/config/data-source'
import { ROLES } from '../../src/constants'

describe('User CRUD operations', () => {
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

    describe('POST /users', () => {
        it('should create a new user', async () => {
            const tenantRepository = connection.getRepository(Tenant)
            const tenant = await tenantRepository.save({
                name: 'Test Tenant',
                address: 'Test Address',
            })

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: ROLES.MANAGER,
                tenantId: tenant.id,
            }

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${adminToken}`])
                .send(userData)

            expect(response.statusCode).toBe(201)

            const userRepository = connection.getRepository(User)
            const user = await userRepository.findOne({
                where: { email: userData.email },
            })
            expect(user).toBeDefined()
            expect(user?.firstName).toBe(userData.firstName)
        })

        it('should return 403 if non-admin tries to create a user', async () => {
            const customerToken = jwks.token({
                sub: '2',
                role: ROLES.CUSTOMER,
            })

            const userData = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123',
                role: ROLES.MANAGER,
            }

            const response = await request(app)
                .post('/users')
                .set('Cookie', [`access_token=${customerToken}`])
                .send(userData)

            expect(response.statusCode).toBe(403)
        })
    })

    describe('GET /users', () => {
        it('should return a list of users', async () => {
            const userRepository = connection.getRepository(User)
            await userRepository.save([
                {
                    firstName: 'User1',
                    lastName: 'L1',
                    email: 'u1@ex.com',
                    password: 'pw',
                    role: ROLES.CUSTOMER,
                },
                {
                    firstName: 'User2',
                    lastName: 'L2',
                    email: 'u2@ex.com',
                    password: 'pw',
                    role: ROLES.CUSTOMER,
                },
            ])

            const response = await request(app)
                .get('/users')
                .set('Cookie', [`access_token=${adminToken}`])
                .send()

            expect(response.statusCode).toBe(200)
            expect(response.body.data).toHaveLength(2)
            expect(response.body.total).toBe(2)
        })
    })

    describe('PATCH /users/:id', () => {
        it('should update user details', async () => {
            const userRepository = connection.getRepository(User)
            const user = await userRepository.save({
                firstName: 'Old',
                lastName: 'Name',
                email: 'old@ex.com',
                password: 'pw',
                role: ROLES.CUSTOMER,
            })

            const updateData = {
                firstName: 'New',
                lastName: 'Name',
                role: ROLES.ADMIN,
                email: 'old@ex.com',
            }

            const response = await request(app)
                .patch(`/users/${user.id}`)
                .set('Cookie', [`access_token=${adminToken}`])
                .send(updateData)

            expect(response.statusCode).toBe(200)

            const updatedUser = await userRepository.findOne({
                where: { id: user.id },
            })
            expect(updatedUser?.firstName).toBe(updateData.firstName)
            expect(updatedUser?.role).toBe(updateData.role)
        })
    })

    describe('DELETE /users/:id', () => {
        it('should delete a user', async () => {
            const userRepository = connection.getRepository(User)
            const user = await userRepository.save({
                firstName: 'To',
                lastName: 'Delete',
                email: 'del@ex.com',
                password: 'pw',
                role: ROLES.CUSTOMER,
            })

            const response = await request(app)
                .delete(`/users/${user.id}`)
                .set('Cookie', [`access_token=${adminToken}`])
                .send()

            expect(response.statusCode).toBe(200)

            const deletedUser = await userRepository.findOne({
                where: { id: user.id },
            })
            expect(deletedUser).toBeNull()
        })
    })
})
