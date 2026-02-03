import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { AppDataSource } from '../../src/data-source.js'
import { User } from '../../src/entity/User.js'
import { DataSource } from 'typeorm'

let connection: DataSource

describe('POST /auth/register', () => {
    beforeAll(async () => {
        connection = AppDataSource
        if (!connection.isInitialized) {
            await connection.initialize()
        }
    })

    beforeEach(async () => {
        // truncate users table before each test
        await connection.getRepository(User).clear()
    })

    afterAll(async () => {
        if (connection.isInitialized) {
            await connection.destroy()
        }
    })

    describe('when the request is valid', () => {
        it('should return valid response', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: '123',
            })

            expect(res.status).toBe(201)
            expect(res.body.message).toBe('Registration successful')
            expect(res.headers['content-type']).toMatch(/json/)
        })

        it('should save the user in the database', async () => {
            await request(app).post('/auth/register').send({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@example.com',
                password: '456',
            })

            const users = await connection
                .getRepository(User)
                .find({ where: { email: 'jane.smith@example.com' } })

            expect(users).toHaveLength(1)
            expect(users[0].firstName).toBe('Jane')
            expect(users[0].lastName).toBe('Smith')
        })
    })
})
