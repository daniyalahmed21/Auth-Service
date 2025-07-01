import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

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

const { PORT, NODE_ENV, DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } =
    {
        PORT: required('PORT'),
        NODE_ENV: required('NODE_ENV'),
        DB_USERNAME: required('DB_USERNAME'),
        DB_PASSWORD: required('DB_PASSWORD'),
        DB_HOST: required('DB_HOST'),
        DB_NAME: required('DB_NAME'),
        DB_PORT: required('DB_PORT'),
    }

export const Config = {
    PORT,
    NODE_ENV,
    DB_USERNAME,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
}
