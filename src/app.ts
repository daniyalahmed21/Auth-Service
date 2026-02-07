import express from 'express'
import { globalErrorHandler } from './middleware/errorHandler.js'
import authRouter from './routes/auth.js'
import tenantRouter from './routes/tenant.js'
import userRouter from './routes/user.js'
import cookieParser from 'cookie-parser'

const app = express()
app.use(express.static('public', { dotfiles: 'allow' }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/auth', authRouter)
app.use('/tenant', tenantRouter)
app.use('/users', userRouter)

app.use(globalErrorHandler)

export default app
