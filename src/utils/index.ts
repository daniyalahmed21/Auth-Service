import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import createHttpError from 'http-errors'
import logger from '../config/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../../certs/private.pem')

export function loadPrivateKey(): Buffer {
    try {
        return fs.readFileSync(PRIVATE_KEY_PATH)
    } catch (err) {
        logger.error('Failed to read private key', {
            path: PRIVATE_KEY_PATH,
            err,
        })
        throw createHttpError(500, 'Failed to read private key')
    }
}
