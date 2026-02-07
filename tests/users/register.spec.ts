import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'
import { AppDataSource } from '../../src/config/data-source.js'
import { User } from '../../src/entity/User.js'
import { DataSource } from 'typeorm'
import { extractToken, isJWT } from '../utils/index.js'
import { RefreshToken } from '../../src/entity/RefreshToken.js'

let connection: DataSource
const plainPassword = 'mysecretpassword'

describe('POST /auth/register', () => {
    beforeAll(async () => {
        connection = AppDataSource
        if (!connection.isInitialized) {
            await connection.initialize()
        }
    })

    beforeEach(async () => {
        await connection.synchronize(true)
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
        }
    })

    describe('when the request is valid', () => {
        it('should return valid response', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                password: plainPassword,
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
                password: plainPassword,
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
                password: plainPassword,
            })

            expect(res.body.id).toBeDefined()
        })

        it("should assign the role 'customer' to the new user", async () => {
            await request(app).post('/auth/register').send({
                firstName: 'Bob',
                lastName: 'Brown',
                email: 'bob.brown@example.com',
                password: plainPassword,
            })
            const user = await connection
                .getRepository(User)
                .findOne({ where: { email: 'bob.brown@example.com' } })
            expect(user?.role).toBe('customer')
        })

        it('should hash the user password before saving', async () => {
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
                email: 'eve.white@example.com',
                password: plainPassword,
            }
            await request(app).post('/auth/register').send(userData)
            const res = await request(app).post('/auth/register').send(userData)
            expect(res.status).toBe(400)
            expect(res.body.errors[0].msg).toBe('Email already registered')
        })

        it('should trim whitespace from email', async () => {
            await request(app).post('/auth/register').send({
                firstName: 'Zoe',
                lastName: 'Adams',
                email: '   zoe.adams@example.com    ',
                password: plainPassword,
            })

            const users = await connection.getRepository(User).find()
            const user = users.find((u) => u.email === 'zoe.adams@example.com')
            expect(user).toBeDefined()
            expect(user!.email).toBe('zoe.adams@example.com')
        })

        it('should have cookies set in the response', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Liam',
                lastName: 'Wilson',
                email: 'liam.wilson@example.com',
                password: plainPassword,
            })

            const cookies = res.headers['set-cookie']
            expect(cookies).toBeDefined()
            expect(cookies).toHaveLength(2)

            expect(isJWT(extractToken(cookies[0]))).toBe(true)
            expect(isJWT(extractToken(cookies[1]))).toBe(true)
        })

        it('should create exactly one refresh token for the registered user', async () => {
            // register user
            const response = await request(app).post('/auth/register').send({
                firstName: 'Refresh',
                lastName: 'Test',
                email: 'refresh.test@example.com',
                password: 'mysecretpassword',
            })

            expect(response.status).toBe(201)
            expect(response.body.id).toBeDefined()

            const userId = response.body.id

            const connection = AppDataSource

            // sanity check user exists
            const user = await connection.getRepository(User).findOne({
                where: { id: userId },
            })

            expect(user).toBeDefined()

            // fetch refresh tokens linked to this user
            const refreshTokenRepo = connection.getRepository(RefreshToken)

            const tokens = await refreshTokenRepo
                .createQueryBuilder('refreshToken')
                .leftJoinAndSelect('refreshToken.user', 'user')
                .where('user.id = :userId', { userId })
                .getMany()

            expect(tokens).toHaveLength(1)
            expect(tokens[0].user.id).toBe(userId)
            expect(tokens[0].expiresAt.getTime()).toBeGreaterThan(Date.now())
        })
    })

    describe('when the request is invalid', () => {
        it('should return 400 if email is missing', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'David',
                lastName: 'Green',
                password: plainPassword,
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe('Email is required')
        })

        it('should return 400 if email is not valid', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Emily',
                lastName: 'Black',
                email: 'invalid-email',
                password: plainPassword,
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe('Email is not valid')
        })

        it('should return 400 if password is missing', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Frank',
                lastName: 'Yellow',
                email: 'frank.yellow@example.com',
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe(
                'Password is required'
            )
        })

        it('should return 400 if password is too short', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Grace',
                lastName: 'Blue',
                email: 'grace.blue@example.com',
                password: '123',
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe(
                'Password must be at least 6 characters long'
            )
        })

        it('should return 400 if first name is missing', async () => {
            const res = await request(app).post('/auth/register').send({
                lastName: 'Orange',
                email: 'grace.orange@example.com',
                password: plainPassword,
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe(
                'First name is required'
            )
        })

        it('should return 400 if last name is missing', async () => {
            const res = await request(app).post('/auth/register').send({
                firstName: 'Hank',
                email: 'grace.hank@example.com',
                password: plainPassword,
            })
            expect(res.status).toBe(400)
            expect(res.body.errors[0].details[0].msg).toBe(
                'Last name is required'
            )
        })
    })
})
