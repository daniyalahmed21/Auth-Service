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

        it('should return user id in the response', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Alice',
                lastName: 'Johnson',
                email: 'alice.johnson@example.com',
                password: '789',
            })

            expect(res.body.id).toBeDefined()
        })

        it("should assign the role 'customer' to the new user", async () => {
            await request(app).post('/auth/register').send({
                firstName: 'Bob',
                lastName: 'Brown',
                email: 'bob.brown@example.com',
                password: '012',
            })
            const user = await connection
                .getRepository(User)
                .findOne({ where: { email: 'bob.brown@example.com' } })
            expect(user?.role).toBe('customer')
        })

        it('should hash the user password before saving', async () => {
            const plainPassword = 'mysecretpassword'
            await request(app).post('/auth/register').send({
                firstName: 'Charlie',
                lastName: 'Davis',
                email: 'charlie.davis@example.com',
                password: plainPassword,
            })
            const user = await connection
                .getRepository(User)
                .findOne({ where: { email: 'charlie.davis@example.com' } })
            expect(user?.password).not.toBe(plainPassword)
            expect(user?.password).toMatch(/^\$2[ayb]\$.{56}$/)
        })

        it('should return 400 if email is already registered', async () => {
            const userData = {
                firstName: 'Eve',
                lastName: 'White',
                email: 'charlie.davis@example.com',
                password: '345',
            }
            await request(app).post('/auth/register').send(userData)
            const res = await request(app).post('/auth/register').send(userData)
            expect(res.status).toBe(400)
            expect(res.body.error[0].message).toBe('Email already registered')
        })
    })
})
