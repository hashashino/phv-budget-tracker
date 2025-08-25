import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().optional(),
  
  // JWT
  JWT_SECRET: Joi.string().min(32).default('development-secret-key-please-change-in-production-32-chars'),
  JWT_EXPIRE: Joi.string().default('7d'),
  
  // Server
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  
  // File Storage
  STORAGE_TYPE: Joi.string().valid('local', 's3').default('local'),
  UPLOAD_PATH: Joi.string().default('./uploads'),
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  
  // AWS S3
  AWS_ACCESS_KEY_ID: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_SECRET_ACCESS_KEY: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  AWS_REGION: Joi.string().default('ap-southeast-1'),
  AWS_S3_BUCKET: Joi.string().when('STORAGE_TYPE', {
    is: 's3',
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  
  // Google Cloud Vision
  GOOGLE_CLOUD_PROJECT_ID: Joi.string().optional(),
  GOOGLE_CLOUD_KEY_FILE: Joi.string().optional(),
  
  // Singapore Banking APIs
  DBS_CLIENT_ID: Joi.string().optional(),
  DBS_CLIENT_SECRET: Joi.string().optional(),
  DBS_API_BASE_URL: Joi.string().uri().default('https://api.dbs.com/v1'),
  
  OCBC_CLIENT_ID: Joi.string().optional(),
  OCBC_CLIENT_SECRET: Joi.string().optional(),
  OCBC_API_BASE_URL: Joi.string().uri().default('https://api.ocbc.com/v1'),
  
  UOB_CLIENT_ID: Joi.string().optional(),
  UOB_CLIENT_SECRET: Joi.string().optional(),
  UOB_API_BASE_URL: Joi.string().uri().default('https://api.uob.com.sg/v1'),
  
  // Email
  SMTP_HOST: Joi.string().default('smtp.gmail.com'),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  EMAIL_FROM: Joi.string().email().default('noreply@phvbudget.com'),
  
  // Redis
  REDIS_URL: Joi.string().uri().default('redis://localhost:6379'),
  
  // Encryption
  ENCRYPTION_KEY: Joi.string().length(32).default('development-encryption-key-32ch'),
  
  // SingPass
  SINGPASS_CLIENT_ID: Joi.string().optional(),
  SINGPASS_CLIENT_SECRET: Joi.string().optional(),
  
  // PHV Platforms
  GRAB_API_KEY: Joi.string().optional(),
  GOJEK_API_KEY: Joi.string().optional(),
  
  // Monitoring
  SENTRY_DSN: Joi.string().uri().optional(),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  
  // Singapore GST
  GST_RATE: Joi.number().min(0).max(1).default(0.08),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  // Database
  database: {
    url: envVars.DATABASE_URL,
  },
  
  // JWT
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
  },
  
  // Server
  server: {
    port: envVars.PORT,
    env: envVars.NODE_ENV,
    frontendUrl: envVars.FRONTEND_URL,
  },
  
  // File Storage
  storage: {
    type: envVars.STORAGE_TYPE,
    uploadPath: envVars.UPLOAD_PATH,
    maxFileSize: envVars.MAX_FILE_SIZE,
  },
  
  // AWS
  aws: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
    region: envVars.AWS_REGION,
    s3Bucket: envVars.AWS_S3_BUCKET,
  },
  
  // Google Cloud
  googleCloud: {
    projectId: envVars.GOOGLE_CLOUD_PROJECT_ID,
    keyFile: envVars.GOOGLE_CLOUD_KEY_FILE,
  },
  
  // Banking APIs
  banking: {
    dbs: {
      clientId: envVars.DBS_CLIENT_ID,
      clientSecret: envVars.DBS_CLIENT_SECRET,
      baseUrl: envVars.DBS_API_BASE_URL,
    },
    ocbc: {
      clientId: envVars.OCBC_CLIENT_ID,
      clientSecret: envVars.OCBC_CLIENT_SECRET,
      baseUrl: envVars.OCBC_API_BASE_URL,
    },
    uob: {
      clientId: envVars.UOB_CLIENT_ID,
      clientSecret: envVars.UOB_CLIENT_SECRET,
      baseUrl: envVars.UOB_API_BASE_URL,
    },
  },
  
  // Email
  email: {
    host: envVars.SMTP_HOST,
    port: envVars.SMTP_PORT,
    user: envVars.SMTP_USER,
    pass: envVars.SMTP_PASS,
    from: envVars.EMAIL_FROM,
  },
  
  // Redis
  redis: {
    url: envVars.REDIS_URL,
  },
  
  // Encryption
  encryption: {
    key: envVars.ENCRYPTION_KEY,
  },
  
  // SingPass
  singpass: {
    clientId: envVars.SINGPASS_CLIENT_ID,
    clientSecret: envVars.SINGPASS_CLIENT_SECRET,
  },
  
  // PHV Platforms
  phvPlatforms: {
    grab: {
      apiKey: envVars.GRAB_API_KEY,
    },
    gojek: {
      apiKey: envVars.GOJEK_API_KEY,
    },
  },
  
  // Monitoring
  monitoring: {
    sentryDsn: envVars.SENTRY_DSN,
    logLevel: envVars.LOG_LEVEL,
  },
  
  // Singapore
  singapore: {
    gstRate: envVars.GST_RATE,
  },
} as const;

export default config;