import { Config } from './config/index.js'
import app from './app.js'

function startServer() {
    const PORT = Config.PORT || 3000
    try {
        app.listen(PORT, () => {
            console.log(`Auth Service is running on port ${PORT}...`)
        })
    } catch (error) {
        console.error('Error starting Auth Service:', error)
    }
}

startServer()
