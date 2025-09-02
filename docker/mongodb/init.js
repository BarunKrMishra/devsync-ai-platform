// MongoDB initialization script for DevSync
// This script sets up the initial database structure and collections

// Switch to the devsync database
db = db.getSiblingDB('devsync');

// Create collections with validation
db.createCollection('logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['level', 'message', 'timestamp'],
      properties: {
        level: {
          bsonType: 'string',
          enum: ['error', 'warn', 'info', 'debug']
        },
        message: {
          bsonType: 'string'
        },
        timestamp: {
          bsonType: 'date'
        },
        metadata: {
          bsonType: 'object'
        }
      }
    }
  }
});

// Create indexes for better performance
db.logs.createIndex({ timestamp: 1 });
db.logs.createIndex({ level: 1 });
db.logs.createIndex({ 'metadata.userId': 1 });

// Create a collection for API connector logs
db.createCollection('connector_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['connectorId', 'action', 'timestamp'],
      properties: {
        connectorId: {
          bsonType: 'string'
        },
        action: {
          bsonType: 'string'
        },
        timestamp: {
          bsonType: 'date'
        },
        status: {
          bsonType: 'string',
          enum: ['success', 'error', 'pending']
        },
        details: {
          bsonType: 'object'
        }
      }
    }
  }
});

db.connector_logs.createIndex({ connectorId: 1, timestamp: -1 });
db.connector_logs.createIndex({ status: 1 });

print('MongoDB initialization completed successfully');
