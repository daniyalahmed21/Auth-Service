import winston from 'winston'
import { Config } from './index.js'

const { NODE_ENV } = Config
const silentLogs = NODE_ENV === 'test'

const logger = winston.createLogger({
    level: 'info',
    defaultMeta: { service: 'auth-service' },
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            ),
            silent: silentLogs,
        }),
        new winston.transports.File({
            filename: 'combined.log',
            level: 'info',
            dirname: './logs',
            silent: silentLogs,
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            dirname: './logs',
            silent: silentLogs,
        }),
    ],
})

export default logger
