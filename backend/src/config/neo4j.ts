import neo4j, { Driver, Session } from 'neo4j-driver';

class Neo4jService {
  private driver: Driver | null = null;
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const username = process.env.NEO4J_USERNAME || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'devsync_password';

      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
      this.isConnected = true;
      
      console.log('✅ Neo4j connected successfully');
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error);
      this.isConnected = false;
    }
  }

  public getSession(): Session | null {
    if (!this.driver || !this.isConnected) {
      console.error('Neo4j driver not connected');
      return null;
    }
    return this.driver.session();
  }

  public async testConnection(): Promise<boolean> {
    try {
      const session = this.getSession();
      if (!session) return false;

      const result = await session.run('RETURN 1 as test');
      await session.close();
      return result.records.length > 0;
    } catch (error) {
      console.error('Neo4j connection test failed:', error);
      return false;
    }
  }

  public async createEntityNode(entityData: {
    id: string;
    name: string;
    type: string;
    properties: Record<string, any>;
  }): Promise<void> {
    const session = this.getSession();
    if (!session) throw new Error('Neo4j session not available');

    try {
      await session.run(
        `CREATE (e:Entity {
          id: $id,
          name: $name,
          type: $type,
          properties: $properties,
          createdAt: datetime()
        })`,
        entityData
      );
    } finally {
      await session.close();
    }
  }

  public async createRelationship(relationshipData: {
    fromId: string;
    toId: string;
    type: string;
    properties: Record<string, any>;
  }): Promise<void> {
    const session = this.getSession();
    if (!session) throw new Error('Neo4j session not available');

    try {
      await session.run(
        `MATCH (from:Entity {id: $fromId})
         MATCH (to:Entity {id: $toId})
         CREATE (from)-[r:${relationshipData.type} $properties]->(to)`,
        {
          fromId: relationshipData.fromId,
          toId: relationshipData.toId,
          properties: relationshipData.properties
        }
      );
    } finally {
      await session.close();
    }
  }

  public async getEntityGraph(projectId: string): Promise<any[]> {
    const session = this.getSession();
    if (!session) throw new Error('Neo4j session not available');

    try {
      const result = await session.run(
        `MATCH (e:Entity)
         WHERE e.projectId = $projectId
         OPTIONAL MATCH (e)-[r]->(related:Entity)
         RETURN e, r, related`,
        { projectId }
      );

      return result.records.map(record => ({
        entity: record.get('e').properties,
        relationship: record.get('r')?.properties,
        related: record.get('related')?.properties
      }));
    } finally {
      await session.close();
    }
  }

  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      this.isConnected = false;
    }
  }
}

export const neo4jService = new Neo4jService();
