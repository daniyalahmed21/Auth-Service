import express from 'express'
import { globalErrorHandler } from './middleware/errorHandler.js'
import authRouter from './routes/auth.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRouter)

app.use(globalErrorHandler)

export default app
