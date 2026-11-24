import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

// Find the workspace root whether running from root or from backend folder
const cwd = process.cwd();
const workspaceRoot = cwd.endsWith('backend') ? path.resolve(cwd, '..') : cwd;

dotenv.config({ path: path.resolve(workspaceRoot, '.env') });
dotenv.config();

const env = process.env.NODE_ENV || 'development';
// Render luôn đặt biến RENDER=true; coi đó là production dù NODE_ENV chưa được đặt.
export const isProduction = env === 'production' || process.env.RENDER === 'true';

// DATA_DIR: nơi lưu database + ảnh upload. Trên Render hãy trỏ vào Persistent Disk (vd /var/data).
const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : workspaceRoot;

// JWT secret: bắt buộc đặt qua biến môi trường ở production.
// Nếu thiếu, sinh khóa ngẫu nhiên cho mỗi lần chạy (token cũ mất hiệu lực khi restart) thay vì dùng khóa công khai.
let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  if (isProduction) {
    console.warn('[SECURITY] JWT_SECRET chưa đặt hoặc < 32 ký tự. Đang dùng khóa ngẫu nhiên tạm thời - hãy đặt JWT_SECRET trên Render!');
    jwtSecret = crypto.randomBytes(48).toString('hex');
  } else {
    jwtSecret = 'banhmi0_jwt_secret_dev_key_32bytes_min';
  }
}

// Mật khẩu admin: production không có mật khẩu mặc định công khai.
const adminPasswordFromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD;
const adminPassword = adminPasswordFromEnv || (isProduction ? crypto.randomBytes(12).toString('base64url') : 'BanhMi0@Admin2026!');

export const config = {
  env,
  isProduction,
  port: parseInt(process.env.PORT || '5000', 10),
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  workspaceRoot,
  dataDir,
  dbFile: path.resolve(dataDir, 'database/banhmi0.sqlite'),
  uploadsDir: path.resolve(dataDir, 'uploads'),
  seedDemoAccounts: !isProduction || process.env.SEED_DEMO_ACCOUNTS === 'true',
  adminBootstrap: {
    email: (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@banhmi0.vn').toLowerCase(),
    password: adminPassword,
    passwordFromEnv: Boolean(adminPasswordFromEnv),
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
