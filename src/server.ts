/**
 * Entry point: initializes TypeORM, then starts the HTTP server.
 */
import 'reflect-metadata'
import { Config } from './config/index.js'
import app from './app.js'
import logger from './config/logger.js'
import { AppDataSource } from './config/data-source.js'

async function startServer(): Promise<void> {
    const PORT = Config.PORT || 3000
    try {
        await AppDataSource.initialize()
        logger.info('Data Source has been initialized!')
        app.listen(PORT, () => {
            logger.info(`Auth Service is running on port ${PORT}...`)
        })
    } catch (error) {
        logger.error('Error starting Auth Service:', error)
    }
}

startServer().catch((error) => {
    logger.error('Unhandled error during server startup:', error)
})
