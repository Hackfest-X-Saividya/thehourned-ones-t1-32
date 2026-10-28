import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env, HonoVariables } from './types';
import { generateRequestId } from './utils/crypto';
import { handleGlobalError } from './middleware/error-handler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limiter';
import { casesRouter } from './routes/cases';
import { generationsRouter } from './routes/generations';
import { imagesRouter } from './routes/images';
import { auditRouter } from './routes/audit';
import { forensicsRouter } from './routes/forensics';

const app = new Hono<{ Bindings: Env; Variables: HonoVariables }>();

// 1. Global Error Handler
app.onError(handleGlobalError);

// 2. Request ID & Timing Middleware
app.use('*', async (c, next) => {
  const reqId = c.req.header('x-request-id') || generateRequestId();
  c.set('requestId', reqId);
  c.header('X-Request-Id', reqId);
  await next();
});

// 3. CORS Configuration for React Frontend
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'x-user-id',
      'x-user-role',
      'x-user-email'
    ],
    exposeHeaders: [
      'X-Request-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Content-Disposition',
      'ETag'
    ],
    maxAge: 86400
  })
);

// 4. Rate Limiting Middleware
app.use('/api/*', rateLimiter({ maxRequests: 120, windowMs: 60_000 }));

// 5. Health & Diagnostic Endpoint (Unauthenticated)
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    service: 'ai-crime-scene-sketch-backend',
    version: '1.0.0',
    environment: c.env.ENVIRONMENT || 'development',
    timestamp: new Date().toISOString(),
    features: {
      workersAi: Boolean(c.env.AI),
      r2Storage: Boolean(c.env.BUCKET),
      d1Database: Boolean(c.env.DB),
      mockAiFallback: c.env.MOCK_AI === 'true'
    }
  });
});

// Root welcome & info
app.get('/', (c) => {
  return c.json({
    name: 'AI Crime Scene Sketch Generator API',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: 'GET /api/health',
      cases: 'POST, GET /api/cases',
      caseDetails: 'GET /api/cases/:caseId',
      caseVersions: 'GET /api/cases/:caseId/versions',
      caseAudit: 'GET /api/cases/:caseId/audit',
      generations: 'POST /api/generations',
      imageDetails: 'GET /api/images/:imageId',
      imageFile: 'GET /api/images/:imageId/file',
      imageMask: 'GET /api/images/:imageId/mask',
      imageEdits: 'POST /api/images/:imageId/edits',
      imageSelect: 'POST /api/images/:imageId/select',
      imageRestore: 'POST /api/images/:imageId/restore',
      imageCompare: 'GET /api/images/:imageId/compare/:otherImageId',
      imageExport: 'POST /api/images/:imageId/export',
      audit: 'GET /api/audit'
    }
  });
});

// 6. Authentication for Protected API Routes
app.use('/api/cases/*', authMiddleware);
app.use('/api/generations/*', authMiddleware);
app.use('/api/images/*', authMiddleware);
app.use('/api/audit/*', authMiddleware);

// 7. Mount Sub-Routers
app.route('/api/cases', casesRouter);
app.route('/api/generations', generationsRouter);
app.route('/api/images', imagesRouter);
app.route('/api/audit', auditRouter);
app.route('/api', forensicsRouter);

export default app;

