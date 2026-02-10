import { config } from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const nodeEnv = process.env.NODE_ENV || 'test'
console.log('NODE_ENV:', nodeEnv)

const envPath = path.resolve(__dirname, `../../.env.${nodeEnv}`)
console.log('Env Path:', envPath)

const result = config({ path: envPath })
console.log('Dotenv result:', result)
console.log('FRONTEND_URL:', process.env.FRONTEND_URL)
