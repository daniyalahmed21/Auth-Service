import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { Config } from './config/index.js'
// import { User } from "./entity/User.js"

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: Config.DB_HOST,
    port: Number(Config.DB_PORT),
    username: Config.DB_USERNAME,
    password: Config.DB_PASSWORD,
    database: 'test',
    synchronize: true,
    logging: false,
    // entities: [User],
    migrations: [],
    subscribers: [],
})
