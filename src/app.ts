import 'reflect-metadata'
import express, {
    type NextFunction,
    type Request,
    type Response,
} from 'express'
import { HttpError } from 'http-errors'
import logger from './config/logger.js'
import authRouter from './routes/auth.js'

const app = express()
app.use(express.json())
app.use('/auth', authRouter)

app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message)
    const statusCode = err.statusCode || 500
    res.status(statusCode).json({
        error: [
            {
                type: err.name || 'InternalServerError',
                message: err.message || 'An unexpected error occurred.',
                path: req.originalUrl,
                location: 'server',
            },
        ],
    })
    next()
})

export default app
