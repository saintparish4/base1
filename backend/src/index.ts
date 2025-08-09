import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { config } from "./config/environment";
import { logger } from "./utils/logger";
import { errorHandler } from "./middleware/error.middleware";
import { loggingMiddleware } from "./middleware/logging.middleware";
import routes from "./routes";
import { connectDatabase } from "./database/connection";
import { connectRedis } from "./config/redis";

const app = express();

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);

app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", limiter);

// Body Parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(loggingMiddleware);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// API Routes
app.use("/api", routes);

// Error Handling
app.use(errorHandler);

// Initialize connections and start server
async function startServer() {
  try {
    await connectDatabase();
    await connectRedis();

    const port = config.port;
    app.listen(port, () => {
      logger.info(` Base Server is running on port ${port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
}

// Export app for testing
export default app;

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

/* 
PRODUCTION DEPLOYMENT INSTRUCTIONS:

1. BUILD THE APPLICATION:
   npm run build
   
2. SET ENVIRONMENT VARIABLES:
   - NODE_ENV=production
   - DATABASE_URL=your_production_database_url
   - REDIS_URL=your_production_redis_url
   - JWT_SECRET=your_secure_jwt_secret
   - PORT=3000 (or your preferred port)
   
3. START PRODUCTION SERVER:
   npm start
   
   OR directly:
   node dist/index.js
   
4. PROCESS MANAGEMENT (recommended):
   Use PM2 for production process management:
   npm install -g pm2
   pm2 start dist/index.js --name "base-backend"
   pm2 startup
   pm2 save
   
5. REVERSE PROXY (recommended):
   Configure nginx/Apache to proxy requests to your Node.js app
   
6. SSL/TLS:
   Ensure HTTPS is configured at the reverse proxy level
   
7. MONITORING:
   - Set up health checks on /health endpoint
   - Monitor logs via Winston logger
   - Use PM2 monitoring: pm2 monit

TESTING INSTRUCTIONS:

1. RUN ALL TESTS:
   npm test
   
2. RUN TESTS IN WATCH MODE (development):
   npm run test:watch
   
3. RUN SPECIFIC TEST SUITES:
   npm test -- --testPathPattern=auth
   npm test -- --testPathPattern=payment
   
4. RUN TESTS WITH COVERAGE:
   npm test -- --coverage
   
5. TEST TYPES:
   - Unit tests: tests/unit/ - Test individual functions/services
   - Integration tests: tests/integration/ - Test API endpoints
   - Load tests: tests/load/ - Test performance under load
   
6. BEFORE TESTING:
   - Ensure test database is set up
   - Set NODE_ENV=test in your environment
   - Tests will automatically use the exported app without starting server
   
7. TEST DATABASE SETUP:
   - Create separate test database
   - Run migrations: npm run migrate (with test DB config)
   - Tests should clean up after themselves
   
8. API TESTING WITH SUPERTEST:
   - Tests import app from this file
   - No need to start actual server
   - Each test can make HTTP requests to endpoints
*/