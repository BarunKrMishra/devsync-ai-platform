import { MongoClient, Db, Collection } from 'mongodb';

class MongoDBService {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/devsync';
      
      this.client = new MongoClient(uri);
      await this.client.connect();
      
      this.db = this.client.db('devsync');
      this.isConnected = true;
      
      console.log('✅ MongoDB connected successfully');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      this.isConnected = false;
    }
  }

  public getCollection<T = any>(name: string): Collection<T> | null {
    if (!this.db || !this.isConnected) {
      console.error('MongoDB not connected');
      return null;
    }
    return this.db.collection<T>(name);
  }

  public async testConnection(): Promise<boolean> {
    try {
      if (!this.db) return false;
      await this.db.admin().ping();
      return true;
    } catch (error) {
      console.error('MongoDB connection test failed:', error);
      return false;
    }
  }

  public async logConnectorActivity(data: {
    connectorId: string;
    action: string;
    status: 'success' | 'error' | 'pending';
    details?: any;
    userId?: string;
  }): Promise<void> {
    const collection = this.getCollection('connector_logs');
    if (!collection) throw new Error('MongoDB collection not available');

    await collection.insertOne({
      ...data,
      timestamp: new Date()
    });
  }

  public async logSystemActivity(data: {
    level: 'error' | 'warn' | 'info' | 'debug';
    message: string;
    metadata?: any;
    userId?: string;
  }): Promise<void> {
    const collection = this.getCollection('logs');
    if (!collection) throw new Error('MongoDB collection not available');

    await collection.insertOne({
      ...data,
      timestamp: new Date()
    });
  }

  public async getConnectorLogs(connectorId: string, limit = 100): Promise<any[]> {
    const collection = this.getCollection('connector_logs');
    if (!collection) throw new Error('MongoDB collection not available');

    return await collection
      .find({ connectorId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  public async getSystemLogs(level?: string, limit = 100): Promise<any[]> {
    const collection = this.getCollection('logs');
    if (!collection) throw new Error('MongoDB collection not available');

    const query = level ? { level } : {};
    return await collection
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
    }
  }
}

export const mongoDBService = new MongoDBService();
