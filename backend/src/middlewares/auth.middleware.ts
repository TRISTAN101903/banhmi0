import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { sendError } from '../utils/response.js';

// Chặn dò mật khẩu: tối đa 10 lần thử đăng nhập/đăng ký mỗi 15 phút cho mỗi IP.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau 15 phút.', 429);
  },
});

// Khách không cần đăng nhập: giới hạn số đơn và số lần tra cứu để chống spam
export const guestOrderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Bạn đặt hàng quá nhiều lần. Vui lòng thử lại sau hoặc gọi hotline của tiệm.', 429);
  },
});

export const trackLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 40,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    sendError(res, 'Tra cứu quá nhiều lần. Vui lòng thử lại sau ít phút.', 429);
  },
});

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 'Chưa được xác thực. Vui lòng đăng nhập.', 401);
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    return sendError(res, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.', 401);
  }

  req.user = payload;
  next();
};

export const optionalAuthenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload) {
      req.user = payload;
    }
  }
  next();
};

export const requireRoles = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Yêu cầu đăng nhập trước khi thực hiện thao tác.', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'Bạn không có quyền hạn truy cập tài nguyên này.', 403);
    }

    next();
  };
};
