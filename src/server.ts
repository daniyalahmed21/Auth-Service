import { Config } from './config/index.js'
import app from './app.js'
import logger from './config/logger.js'

function startServer() {
    const PORT = Config.PORT || 3000
    try {
        app.listen(PORT, () => {
            logger.info(`Auth Service is running on port ${PORT}...`)
        })
    } catch (error) {
        logger.error('Error starting Auth Service:', error)
    }
}

startServer()
