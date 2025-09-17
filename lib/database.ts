/**
 * Database connection and client initialization
 * 
 * This file sets up the Prisma client with proper configuration
 * for development and production environments.
 */

import { PrismaClient } from '@prisma/client';

// Global variable to hold the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Create a new Prisma client instance with optimized configuration
 * 
 * @returns {PrismaClient} Configured Prisma client
 */
function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
}

/**
 * Global Prisma client instance
 * 
 * In development, we use global variables to prevent multiple instances
 * due to hot reloading. In production, we create a single instance.
 */
export const prisma = globalThis.prisma ?? createPrismaClient();

// Prevent multiple instances in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

/**
 * Database connection test utility
 * 
 * @returns {Promise<boolean>} True if connection is successful
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Graceful shutdown handler for the database connection
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error disconnecting from database:', error);
  }
}