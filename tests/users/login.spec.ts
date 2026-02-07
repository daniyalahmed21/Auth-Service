import { DataSource } from 'typeorm'
import request from 'supertest'
import { AppDataSource } from '../../src/config/data-source.js'
import app from '../../src/app.js'
import { User } from '../../src/entity/User.js'
import { ROLES } from '../../src/constants/index.js'
import bcrypt from 'bcryptjs'
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'

describe('POST /auth/login', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = AppDataSource
        if (!connection.isInitialized) {
            await connection.initialize()
        }
    })

    beforeEach(async () => {
        if (connection.isInitialized) {
            await connection.dropDatabase()
            await connection.synchronize()
        }
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
        }
    })

    const createUser = async (userData: Partial<User>) => {
        const userRepository = connection.getRepository(User)
        const password = await bcrypt.hash(userData.password || 'password', 10)
        return userRepository.save({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            role: ROLES.CUSTOMER,
            ...userData,
            password,
        })
    }

    it('should return 200 and access token if login is successful', async () => {
        const email = 'test@example.com'
        const password = 'password'
        await createUser({ email, password })

        const response = await request(app).post('/auth/login').send({
            email,
            password,
        })

        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty('id')
        // Check for cookies
        const cookies = response.headers['set-cookie']
        expect(cookies).toBeDefined()
        expect(cookies).toBeTruthy()

        let cookieString = ''
        if (Array.isArray(cookies)) {
            cookieString = cookies.join(' ')
        } else if (typeof cookies === 'string') {
            cookieString = cookies
        }

        expect(cookieString).toContain('access_token')
        expect(cookieString).toContain('refresh_token')
    })

    it('should return 400 if validation fails', async () => {
        const response = await request(app).post('/auth/login').send({
            email: 'invalid-email',
            password: '',
        })

        expect(response.status).toBe(400)
        expect(response.body).toHaveProperty('errors')
    })

    it('should return 401 if user does not exist', async () => {
        const response = await request(app).post('/auth/login').send({
            email: 'nonexistent@example.com',
            password: 'password',
        })

        expect(response.status).toBe(401)
    })

    it('should return 401 if password is incorrect', async () => {
        const email = 'test@example.com'
        const password = 'password'
        await createUser({ email, password })

        const response = await request(app).post('/auth/login').send({
            email,
            password: 'wrongpassword',
        })

        expect(response.status).toBe(401)
    })
})
