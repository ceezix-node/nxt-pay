import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import healthRouter from './routes/health.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(express.json({ limit: '32kb' }))

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(value => value.trim())
  .filter(Boolean)

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    return callback(new Error('Origin not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Idempotency-Key'
  ]
}))

const prefix = (
  process.env.API_PREFIX || '/tiamat'
).replace(/\/+$/, '') || ''

app.use(prefix, healthRouter)

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  })
})

app.use((error, _req, res, _next) => {
  if (error.message === 'Origin not allowed by CORS') {
    return res.status(403).json({ error: error.message })
  }

  return res.status(500).json({
    error: 'Internal server error'
  })
})

export default app
