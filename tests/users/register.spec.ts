import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('POST /auth/register', () => {
    it('should register user', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ username: 'testuser', password: '123' })
        expect(res.status).toBe(201)
        expect(res.body.message).toBe('Registration successful')
        expect(res.headers['content-type']).toMatch(/json/)
    })
})
