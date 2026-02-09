/**
 * Loads env from .env.${NODE_ENV} and exports validated config.
 * Throws on missing required vars.
 */
import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function required(key: string): string {
    const value = process.env[key]
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`)
    }
    return value
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

config({ path: path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`) })

const {
    PORT,
    NODE_ENV,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
} = {
    PORT: required('PORT'),
    NODE_ENV: required('NODE_ENV'),
    DB_USERNAME: required('DB_USERNAME'),
    DB_PASSWORD: required('DB_PASSWORD'),
    DB_HOST: required('DB_HOST'),
    DB_NAME: required('DB_NAME'),
    DB_PORT: required('DB_PORT'),
    REFRESH_TOKEN_SECRET: required('REFRESH_TOKEN_SECRET'),
    JWKS_URI: required('JWKS_URI'),
}

export const Config = {
    PORT,
    NODE_ENV,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    REFRESH_TOKEN_SECRET,
    JWKS_URI,
}
