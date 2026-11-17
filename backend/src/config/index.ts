import dotenv from 'dotenv';
import path from 'path';

// Find the workspace root whether running from root or from backend folder
const cwd = process.cwd();
const workspaceRoot = cwd.endsWith('backend') ? path.resolve(cwd, '..') : cwd;

dotenv.config({ path: path.resolve(workspaceRoot, '.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'banhmi0_jwt_secret_dev_key_32bytes_min',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  workspaceRoot,
  dbFile: path.resolve(workspaceRoot, 'database/banhmi0.sqlite'),
  uploadsDir: path.resolve(workspaceRoot, 'uploads'),
  adminBootstrap: {
    email: process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@banhmi0.vn',
    password: process.env.ADMIN_BOOTSTRAP_PASSWORD || 'BanhMi0@Admin2026!',
    name: process.env.ADMIN_BOOTSTRAP_NAME || 'Quản Trị Viên BÁNH MÌ 0',
    phone: process.env.ADMIN_BOOTSTRAP_PHONE || '0901234567',
  },
  store: {
    name: process.env.STORE_NAME || 'BÁNH MÌ 0',
    slogan: process.env.STORE_SLOGAN || 'TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ',
    address: process.env.STORE_ADDRESS || '123 Đường Bánh Mì, Quận 1, TP. Hồ Chí Minh',
    phone: process.env.STORE_PHONE || '0987654321',
    logoUrl: '/logo_banhmi0.jpg',
    showcaseUrl: '/store_showcase.jpg',
  }
};
