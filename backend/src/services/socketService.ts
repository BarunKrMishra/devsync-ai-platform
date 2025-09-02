import { Server as SocketIOServer, Socket } from 'socket.io'
import { logger } from '@/config/logger'

export class SocketService {
  private io: SocketIOServer
  private connectedUsers: Map<string, string> = new Map() // socketId -> userId

  constructor(io: SocketIOServer) {
    this.io = io
  }

  handleConnection(socket: Socket): void {
    logger.info('Client connected', { socketId: socket.id })

    // Handle authentication
    socket.on('authenticate', (data: { token: string }) => {
      try {
        // Verify JWT token here
        // const decoded = jwt.verify(data.token, config.auth.jwtSecret)
        // const userId = decoded.userId
        
        // For now, we'll use a simple user ID from the token
        const userId = data.token // This should be the actual user ID after JWT verification
        
        this.connectedUsers.set(socket.id, userId)
        socket.join(`user:${userId}`)
        
        logger.info('User authenticated via socket', { socketId: socket.id, userId })
        
        socket.emit('authenticated', { success: true })
      } catch (error) {
        logger.error('Socket authentication failed', { socketId: socket.id, error: error.message })
        socket.emit('authentication_error', { message: 'Invalid token' })
      }
    })

    // Handle project updates
    socket.on('join_project', (data: { projectId: string }) => {
      const userId = this.connectedUsers.get(socket.id)
      if (userId) {
        socket.join(`project:${data.projectId}`)
        logger.info('User joined project room', { socketId: socket.id, userId, projectId: data.projectId })
      }
    })

    socket.on('leave_project', (data: { projectId: string }) => {
      socket.leave(`project:${data.projectId}`)
      logger.info('User left project room', { socketId: socket.id, projectId: data.projectId })
    })

    // Handle real-time collaboration
    socket.on('project_update', (data: { projectId: string, update: any }) => {
      const userId = this.connectedUsers.get(socket.id)
      if (userId) {
        // Broadcast update to all users in the project room except sender
        socket.to(`project:${data.projectId}`).emit('project_updated', {
          userId,
          update: data.update,
          timestamp: new Date().toISOString()
        })
        
        logger.info('Project update broadcasted', {
          socketId: socket.id,
          userId,
          projectId: data.projectId
        })
      }
    })

    // Handle AI translation progress
    socket.on('translation_progress', (data: { translationId: string, progress: number, status: string }) => {
      const userId = this.connectedUsers.get(socket.id)
      if (userId) {
        socket.emit('translation_progress_update', {
          translationId: data.translationId,
          progress: data.progress,
          status: data.status,
          timestamp: new Date().toISOString()
        })
      }
    })

    // Handle connector status updates
    socket.on('connector_status', (data: { connectorId: string, status: string, message?: string }) => {
      const userId = this.connectedUsers.get(socket.id)
      if (userId) {
        socket.emit('connector_status_update', {
          connectorId: data.connectorId,
          status: data.status,
          message: data.message,
          timestamp: new Date().toISOString()
        })
      }
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      const userId = this.connectedUsers.get(socket.id)
      if (userId) {
        this.connectedUsers.delete(socket.id)
        logger.info('User disconnected', { socketId: socket.id, userId })
      } else {
        logger.info('Anonymous client disconnected', { socketId: socket.id })
      }
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error: error.message })
    })
  }

  // Broadcast methods
  broadcastToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data)
    logger.info('Broadcasted to user', { userId, event })
  }

  broadcastToProject(projectId: string, event: string, data: any): void {
    this.io.to(`project:${projectId}`).emit(event, data)
    logger.info('Broadcasted to project', { projectId, event })
  }

  broadcastToAll(event: string, data: any): void {
    this.io.emit(event, data)
    logger.info('Broadcasted to all clients', { event })
  }

  // Translation progress updates
  updateTranslationProgress(userId: string, translationId: string, progress: number, status: string): void {
    this.broadcastToUser(userId, 'translation_progress_update', {
      translationId,
      progress,
      status,
      timestamp: new Date().toISOString()
    })
  }

  // Connector status updates
  updateConnectorStatus(userId: string, connectorId: string, status: string, message?: string): void {
    this.broadcastToUser(userId, 'connector_status_update', {
      connectorId,
      status,
      message,
      timestamp: new Date().toISOString()
    })
  }

  // Project updates
  notifyProjectUpdate(projectId: string, update: any, userId?: string): void {
    this.broadcastToProject(projectId, 'project_updated', {
      userId,
      update,
      timestamp: new Date().toISOString()
    })
  }

  // System notifications
  sendSystemNotification(userId: string, type: string, message: string, data?: any): void {
    this.broadcastToUser(userId, 'system_notification', {
      type,
      message,
      data,
      timestamp: new Date().toISOString()
    })
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size
  }

  // Get user's socket ID
  getUserSocketId(userId: string): string | undefined {
    for (const [socketId, uid] of this.connectedUsers.entries()) {
      if (uid === userId) {
        return socketId
      }
    }
    return undefined
  }
}
