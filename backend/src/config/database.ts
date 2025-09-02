import { PrismaClient } from '@prisma/client'
import neo4j from 'neo4j-driver'
import { MongoClient } from 'mongodb'
import { createClient } from 'redis'
import { config } from './config'
import { logger } from './logger'

// Prisma Client
export const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty'
})

// Neo4j Driver
export const neo4jDriver = neo4j.driver(
  config.database.neo4j.uri,
  neo4j.auth.basic(config.database.neo4j.username, config.database.neo4j.password),
  {
    maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
  }
)

// MongoDB Client
export const mongoClient = new MongoClient(config.database.mongodb.uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})

// Redis Client
export const redisClient = createClient({
  url: config.database.redis.url,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
})

// Database connection function
export async function connectDatabases(): Promise<void> {
  try {
    // Connect to PostgreSQL via Prisma
    await prisma.$connect()
    logger.info('✅ Connected to PostgreSQL')

    // Connect to Neo4j
    await neo4jDriver.verifyConnectivity()
    logger.info('✅ Connected to Neo4j')

    // Connect to MongoDB
    await mongoClient.connect()
    logger.info('✅ Connected to MongoDB')

    // Connect to Redis
    await redisClient.connect()
    logger.info('✅ Connected to Redis')

    // Setup Redis event listeners
    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected')
    })

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready')
    })

    redisClient.on('end', () => {
      logger.info('Redis Client Disconnected')
    })

  } catch (error) {
    logger.error('Database connection failed:', error)
    throw error
  }
}

// Database disconnection function
export async function disconnectDatabases(): Promise<void> {
  try {
    await prisma.$disconnect()
    await neo4jDriver.close()
    await mongoClient.close()
    await redisClient.quit()
    logger.info('✅ Disconnected from all databases')
  } catch (error) {
    logger.error('Database disconnection failed:', error)
    throw error
  }
}

// Health check function
export async function checkDatabaseHealth(): Promise<{
  postgres: boolean
  neo4j: boolean
  mongodb: boolean
  redis: boolean
}> {
  const health = {
    postgres: false,
    neo4j: false,
    mongodb: false,
    redis: false
  }

  try {
    // Check PostgreSQL
    await prisma.$queryRaw`SELECT 1`
    health.postgres = true
  } catch (error) {
    logger.error('PostgreSQL health check failed:', error)
  }

  try {
    // Check Neo4j
    const session = neo4jDriver.session()
    await session.run('RETURN 1')
    await session.close()
    health.neo4j = true
  } catch (error) {
    logger.error('Neo4j health check failed:', error)
  }

  try {
    // Check MongoDB
    await mongoClient.db('admin').command({ ping: 1 })
    health.mongodb = true
  } catch (error) {
    logger.error('MongoDB health check failed:', error)
  }

  try {
    // Check Redis
    await redisClient.ping()
    health.redis = true
  } catch (error) {
    logger.error('Redis health check failed:', error)
  }

  return health
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDatabases()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await disconnectDatabases()
  process.exit(0)
})
