-- PostgreSQL initialization script for DevSync
-- This script sets up the initial database structure

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types if needed
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set up initial configuration
ALTER DATABASE devsync SET timezone TO 'UTC';

-- Create indexes for better performance
-- These will be created by Prisma migrations, but we can add custom ones here
