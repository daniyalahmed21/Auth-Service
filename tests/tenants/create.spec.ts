import { DataSource } from 'typeorm'
import {
    describe,
    beforeAll,
    beforeEach,
    afterEach,
    afterAll,
    it,
    expect,
} from 'vitest'
import { AppDataSource } from '../../src/config/data-source'
import request from 'supertest'
import app from '../../src/app'

describe('POST /tenant', () => {
    let connection: DataSource

    beforeAll(async () => {
        connection = await AppDataSource.initialize()
    })

    beforeEach(async () => {
        await connection.dropDatabase()
        await connection.synchronize()
    })

    afterAll(async () => {
        if (connection && connection.isInitialized) {
            await connection.destroy()
        }
    })

    describe('Given all fields', () => {
        it('should return the 201 status code', async () => {
            const response = await request(app).post('/tenant').send({
                name: 'Tenant 1',
                address: 'Address 1',
            })
            expect(response.statusCode).toBe(201)
        })
    })
})
