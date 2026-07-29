import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

const optionalBool = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0'])])
  .optional()
  .transform((v) => {
    if (v === undefined) return undefined;
    if (typeof v === 'boolean') return v;
    return v === 'true' || v === '1';
  });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16, 'Access secret must be at least 16 characters long'),
  JWT_REFRESH_SECRET: z.string().min(16, 'Refresh secret must be at least 16 characters long'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .optional(),
  LOG_TO_FILE: optionalBool,
  LOG_DIR: z.string().default('logs'),
  LOG_REQUEST_BODY: optionalBool,
  LOG_DB_QUERIES: optionalBool,
  LOG_SLOW_QUERY_MS: z.coerce.number().default(500),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment configuration:', parsed.error.format());
  process.exit(1);
}

const raw = parsed.data;
const isDev = raw.NODE_ENV === 'development';
const isTest = raw.NODE_ENV === 'test';

export const config = {
  ...raw,
  LOG_LEVEL:
    raw.LOG_LEVEL ?? (isTest ? ('silent' as const) : isDev ? ('debug' as const) : ('info' as const)),
  LOG_TO_FILE: raw.LOG_TO_FILE ?? !isTest,
  LOG_REQUEST_BODY: raw.LOG_REQUEST_BODY ?? isDev,
  LOG_DB_QUERIES: raw.LOG_DB_QUERIES ?? isDev,
};

export type Config = typeof config;
