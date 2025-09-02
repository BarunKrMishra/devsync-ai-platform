import Queue from 'bull'
import { config } from '@/config/config'
import { logger } from '@/config/logger'

export interface TranslationJob {
  id: string
  userId: string
  projectId: string
  requirements: string
  options: {
    framework?: string
    database?: string
    includeAuth?: boolean
    includeTests?: boolean
  }
}

export interface ConnectorJob {
  id: string
  userId: string
  connectorId: string
  method: string
  endpoint: string
  data?: any
  credentials?: any
}

export interface EmailJob {
  id: string
  to: string
  subject: string
  content: string
  from?: string
  template?: string
  variables?: Record<string, any>
}

export class QueueService {
  private translationQueue: Queue.Queue<TranslationJob>
  private connectorQueue: Queue.Queue<ConnectorJob>
  private emailQueue: Queue.Queue<EmailJob>
  private notificationQueue: Queue.Queue<any>

  constructor() {
    // Initialize queues
    this.translationQueue = new Queue('translation', {
      redis: {
        host: config.queue.redis.host,
        port: config.queue.redis.port,
        password: config.queue.redis.password
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })

    this.connectorQueue = new Queue('connector', {
      redis: {
        host: config.queue.redis.host,
        port: config.queue.redis.port,
        password: config.queue.redis.password
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })

    this.emailQueue = new Queue('email', {
      redis: {
        host: config.queue.redis.host,
        port: config.queue.redis.port,
        password: config.queue.redis.password
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })

    this.notificationQueue = new Queue('notification', {
      redis: {
        host: config.queue.redis.host,
        port: config.queue.redis.port,
        password: config.queue.redis.password
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        }
      }
    })

    this.setupProcessors()
    this.setupEventHandlers()
  }

  private setupProcessors(): void {
    // Translation processor
    this.translationQueue.process('translate', config.queue.concurrency, async (job) => {
      const { id, userId, projectId, requirements, options } = job.data
      
      logger.info('Processing translation job', { jobId: job.id, userId, projectId })
      
      try {
        // Import AI translator service
        const { AITranslatorService } = await import('@/services/aiTranslatorService')
        const aiTranslator = new AITranslatorService()
        
        // Update progress
        job.progress(10)
        
        // Translate requirements
        const result = await aiTranslator.translateRequirements(requirements, options)
        
        // Update progress
        job.progress(90)
        
        // Store result in database
        // This would typically save the translation result to the database
        
        // Update progress
        job.progress(100)
        
        logger.info('Translation job completed', { jobId: job.id, userId, projectId })
        
        return result
      } catch (error) {
        logger.error('Translation job failed', { jobId: job.id, userId, projectId, error: error.message })
        throw error
      }
    })

    // Connector processor
    this.connectorQueue.process('connector_request', config.queue.concurrency, async (job) => {
      const { id, userId, connectorId, method, endpoint, data, credentials } = job.data
      
      logger.info('Processing connector job', { jobId: job.id, userId, connectorId })
      
      try {
        // Import API connector service
        const { ApiConnectorService } = await import('@/services/apiConnectorService')
        const connectorService = new ApiConnectorService()
        
        // Update progress
        job.progress(10)
        
        // Make connector request
        const result = await connectorService.makeRequest(connectorId, method, endpoint, data)
        
        // Update progress
        job.progress(100)
        
        logger.info('Connector job completed', { jobId: job.id, userId, connectorId })
        
        return result
      } catch (error) {
        logger.error('Connector job failed', { jobId: job.id, userId, connectorId, error: error.message })
        throw error
      }
    })

    // Email processor
    this.emailQueue.process('send_email', config.queue.concurrency, async (job) => {
      const { id, to, subject, content, from, template, variables } = job.data
      
      logger.info('Processing email job', { jobId: job.id, to, subject })
      
      try {
        // Import email service
        const { EmailService } = await import('@/services/emailService')
        const emailService = new EmailService()
        
        // Update progress
        job.progress(10)
        
        // Send email
        const result = await emailService.sendEmail(to, subject, content, from, template, variables)
        
        // Update progress
        job.progress(100)
        
        logger.info('Email job completed', { jobId: job.id, to, subject })
        
        return result
      } catch (error) {
        logger.error('Email job failed', { jobId: job.id, to, subject, error: error.message })
        throw error
      }
    })

    // Notification processor
    this.notificationQueue.process('send_notification', config.queue.concurrency, async (job) => {
      const { userId, type, message, data } = job.data
      
      logger.info('Processing notification job', { jobId: job.id, userId, type })
      
      try {
        // Import notification service
        const { NotificationService } = await import('@/services/notificationService')
        const notificationService = new NotificationService()
        
        // Update progress
        job.progress(10)
        
        // Send notification
        const result = await notificationService.sendNotification(userId, type, message, data)
        
        // Update progress
        job.progress(100)
        
        logger.info('Notification job completed', { jobId: job.id, userId, type })
        
        return result
      } catch (error) {
        logger.error('Notification job failed', { jobId: job.id, userId, type, error: error.message })
        throw error
      }
    })
  }

  private setupEventHandlers(): void {
    // Translation queue events
    this.translationQueue.on('completed', (job, result) => {
      logger.info('Translation job completed', { jobId: job.id, result })
    })

    this.translationQueue.on('failed', (job, error) => {
      logger.error('Translation job failed', { jobId: job.id, error: error.message })
    })

    this.translationQueue.on('progress', (job, progress) => {
      logger.info('Translation job progress', { jobId: job.id, progress })
    })

    // Connector queue events
    this.connectorQueue.on('completed', (job, result) => {
      logger.info('Connector job completed', { jobId: job.id, result })
    })

    this.connectorQueue.on('failed', (job, error) => {
      logger.error('Connector job failed', { jobId: job.id, error: error.message })
    })

    // Email queue events
    this.emailQueue.on('completed', (job, result) => {
      logger.info('Email job completed', { jobId: job.id, result })
    })

    this.emailQueue.on('failed', (job, error) => {
      logger.error('Email job failed', { jobId: job.id, error: error.message })
    })

    // Notification queue events
    this.notificationQueue.on('completed', (job, result) => {
      logger.info('Notification job completed', { jobId: job.id, result })
    })

    this.notificationQueue.on('failed', (job, error) => {
      logger.error('Notification job failed', { jobId: job.id, error: error.message })
    })
  }

  // Queue job methods
  async addTranslationJob(jobData: TranslationJob): Promise<Queue.Job<TranslationJob>> {
    const job = await this.translationQueue.add('translate', jobData, {
      priority: 1,
      delay: 0
    })
    
    logger.info('Translation job added', { jobId: job.id, userId: jobData.userId })
    return job
  }

  async addConnectorJob(jobData: ConnectorJob): Promise<Queue.Job<ConnectorJob>> {
    const job = await this.connectorQueue.add('connector_request', jobData, {
      priority: 2,
      delay: 0
    })
    
    logger.info('Connector job added', { jobId: job.id, userId: jobData.userId })
    return job
  }

  async addEmailJob(jobData: EmailJob): Promise<Queue.Job<EmailJob>> {
    const job = await this.emailQueue.add('send_email', jobData, {
      priority: 3,
      delay: 0
    })
    
    logger.info('Email job added', { jobId: job.id, to: jobData.to })
    return job
  }

  async addNotificationJob(jobData: any): Promise<Queue.Job<any>> {
    const job = await this.notificationQueue.add('send_notification', jobData, {
      priority: 4,
      delay: 0
    })
    
    logger.info('Notification job added', { jobId: job.id, userId: jobData.userId })
    return job
  }

  // Queue management methods
  async getQueueStats(): Promise<any> {
    const [translationStats, connectorStats, emailStats, notificationStats] = await Promise.all([
      this.translationQueue.getJobCounts(),
      this.connectorQueue.getJobCounts(),
      this.emailQueue.getJobCounts(),
      this.notificationQueue.getJobCounts()
    ])

    return {
      translation: translationStats,
      connector: connectorStats,
      email: emailStats,
      notification: notificationStats
    }
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    if (queue) {
      await queue.pause()
      logger.info('Queue paused', { queueName })
    }
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    if (queue) {
      await queue.resume()
      logger.info('Queue resumed', { queueName })
    }
  }

  async clearQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    if (queue) {
      await queue.empty()
      logger.info('Queue cleared', { queueName })
    }
  }

  private getQueue(queueName: string): Queue.Queue | null {
    switch (queueName) {
      case 'translation':
        return this.translationQueue
      case 'connector':
        return this.connectorQueue
      case 'email':
        return this.emailQueue
      case 'notification':
        return this.notificationQueue
      default:
        return null
    }
  }

  // Cleanup method
  async close(): Promise<void> {
    await Promise.all([
      this.translationQueue.close(),
      this.connectorQueue.close(),
      this.emailQueue.close(),
      this.notificationQueue.close()
    ])
    
    logger.info('All queues closed')
  }
}
