import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { config } from './config/index.js';
import { seedDatabase } from './database/seed.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import statsRoutes from './routes/stats.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const app = express();

// Sau proxy của Render: lấy IP thật của khách để rate-limit đăng nhập đúng theo từng người
if (config.isProduction) {
  app.set('trust proxy', 1);
}

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'img-src': ["'self'", 'data:', 'https:'],
    },
  },
}));
app.use(cors({
  origin: ['https://banh-mi-0.onrender.com', 'http://localhost:5173', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Serve static uploads
const uploadsPath = config.uploadsDir;
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath, { maxAge: '7d' }));
// Ảnh thương hiệu đi kèm mã nguồn (khi DATA_DIR trỏ sang ổ đĩa riêng)
app.use('/uploads', express.static(path.resolve(config.workspaceRoot, 'uploads'), { maxAge: '7d' }));

// Serve the built frontend (enables single-service deploy: Render/Railway/VPS
// serve both API and static site from one process). Skipped in local dev
// where frontend runs on its own Vite server (port 5173) and frontend/dist
// doesn't exist yet.
const frontendDistPath = path.resolve(config.workspaceRoot, 'frontend/dist');
const hasFrontendBuild = fs.existsSync(frontendDistPath);
if (hasFrontendBuild) {
  app.use('/assets', express.static(path.join(frontendDistPath, 'assets'), { maxAge: '365d', immutable: true }));
  app.use(express.static(frontendDistPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('index.html')) res.setHeader('Cache-Control', 'no-cache');
    },
  }));
}

// API Routes
const apiPrefix = config.apiPrefix;
app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/categories`, categoryRoutes);
app.use(`${apiPrefix}/products`, productRoutes);
app.use(`${apiPrefix}/orders`, orderRoutes);
app.use(`${apiPrefix}/inventory`, inventoryRoutes);
app.use(`${apiPrefix}/delivery`, deliveryRoutes);
app.use(`${apiPrefix}/stats`, statsRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// SPA fallback: any non-API, non-upload GET request returns index.html so
// React Router can handle the route client-side (e.g. a hard refresh on /menu).
if (hasFrontendBuild) {
  app.get(/^(?!\/api|\/uploads|\/health).*/, (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// Fallback error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  // Lỗi do người dùng gửi file không hợp lệ -> 400 thay vì 500
  if (err && (err.name === 'MulterError' || String(err.message || '').startsWith('Chỉ chấp nhận'))) {
    return res.status(400).json({ success: false, message: err.message, error: err.message });
  }
  res.status(500).json({
    success: false,
    message: config.isProduction ? 'Lỗi máy chủ nội bộ' : (err.message || 'Lỗi máy chủ nội bộ'),
    error: config.env === 'development' ? err.stack : undefined,
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await seedDatabase();
    app.listen(config.port, () => {
      console.log(`=======================================================`);
      console.log(`🚀 ${config.store.name} - Máy chủ vận hành sẵn sàng!`);
      console.log(`   Khẩu hiệu: ${config.store.slogan}`);
      console.log(`   Địa chỉ API: http://localhost:${config.port}${apiPrefix}`);
      console.log(`   Tài sản tĩnh: http://localhost:${config.port}/uploads`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Lỗi khởi động máy chủ:', error);
    process.exit(1);
  }
};

startServer();
