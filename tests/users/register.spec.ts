import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../src/app.js'

describe('POST /auth/register', () => {
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
    })
})
