import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import createHttpError from 'http-errors'
import logger from '../config/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PRIVATE_KEY_PATH = path.resolve(__dirname, '../../certs/private.pem')

export function loadPrivateKey(): Buffer {
    // Read from PRIVATE_KEY environment variable (for CI/CD and local development)
    const privateKeyFromEnv = process.env.PRIVATE_KEY
    if (privateKeyFromEnv) {
        try {
            // Handle both single-line and multi-line keys (replace escaped newlines)
            const keyContent = privateKeyFromEnv.replaceAll('\\n', '\n')
            return Buffer.from(keyContent, 'utf-8')
        } catch (err) {
            logger.error(
                'Failed to parse PRIVATE_KEY from environment variable',
                { err }
            )
            throw createHttpError(
                500,
                'Failed to parse private key from environment'
            )
        }
    }

    // Fall back to reading from file (for local development if env var not set)
    try {
        return fs.readFileSync(PRIVATE_KEY_PATH)
    } catch (err) {
        logger.error('Failed to read private key', {
            path: PRIVATE_KEY_PATH,
            err,
        })
        throw createHttpError(
            500,
            'Failed to read private key from file or environment'
        )
    }
}
