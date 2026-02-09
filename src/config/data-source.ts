import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from './index.js'
import { User } from '../entity/User.js'
import { Tenant } from '../entity/Tenant.js'
import { RefreshToken } from '../entity/RefreshToken.js'

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: Config.DB_NAME,
    synchronize: false,
    logging: false,
    entities: [User, Tenant, RefreshToken],
    migrations: ['src/migration/*.js'],
    subscribers: [],
    extra: {
        // Prefer IPv4 connections to avoid IPv6 connectivity issues
        family: 4,
    },
})
