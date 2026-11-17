import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { hashPassword, comparePassword, signToken } from '../utils/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, full_name, phone, address } = req.body;

    if (!email || !password || !full_name) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Mật khẩu phải chứa ít nhất 6 ký tự.', 400);
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return sendError(res, 'Email này đã được đăng ký tài khoản trong hệ thống.', 409);
    }

    // Get customer role id
    const customerRole = db.prepare("SELECT id FROM roles WHERE code = 'CUSTOMER'").get() as { id: number };
    const passwordHash = await hashPassword(password);

    const result = db.prepare(`
      INSERT INTO users (role_id, email, password_hash, full_name, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(customerRole.id, email, passwordHash, full_name, phone || null, address || null);

    const userId = Number(result.lastInsertRowid);
    const token = signToken({
      userId,
      email,
      role: 'CUSTOMER',
      fullName: full_name,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: userId,
        email,
        full_name,
        phone: phone || null,
        address: address || null,
        role: 'CUSTOMER',
      }
    }, 'Đăng ký tài khoản BÁNH MÌ 0 thành công!', 201);
  } catch (error: any) {
    console.error('Lỗi đăng ký:', error);
    return sendError(res, 'Đã xảy ra lỗi khi tạo tài khoản.', 500);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Vui lòng nhập email và mật khẩu.', 400);
    }

    const user = db.prepare(`
      SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.address, r.code as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `).get(email) as any;

    if (!user) {
      return sendError(res, 'Thông tin đăng nhập không chính xác.', 401);
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return sendError(res, 'Thông tin đăng nhập không chính xác.', 401);
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.full_name,
    });

    return sendSuccess(res, {
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        address: user.address,
        role: user.role,
      }
    }, 'Đăng nhập thành công!');
  } catch (error: any) {
    console.error('Lỗi đăng nhập:', error);
    return sendError(res, 'Đã xảy ra lỗi hệ thống khi đăng nhập.', 500);
  }
};

export const getProfile = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const user = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.phone, u.address, r.code as role, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(userId) as any;

    if (!user) {
      return sendError(res, 'Không tìm thấy người dùng.', 404);
    }

    return sendSuccess(res, user);
  } catch (error: any) {
    return sendError(res, 'Lỗi truy xuất thông tin cá nhân.', 500);
  }
};

export const updateProfile = (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { full_name, phone, address } = req.body;

    if (!full_name) {
      return sendError(res, 'Họ tên không được để trống.', 400);
    }

    db.prepare(`
      UPDATE users
      SET full_name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(full_name, phone || null, address || null, userId);

    const updatedUser = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.phone, u.address, r.code as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `).get(userId);

    return sendSuccess(res, updatedUser, 'Cập nhật thông tin thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật thông tin.', 500);
  }
};

export const getStaffList = (req: AuthRequest, res: Response) => {
  try {
    const list = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.phone, r.code as role, u.created_at
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.code IN ('STAFF', 'SHIPPER')
      ORDER BY u.id DESC
    `).all();

    return sendSuccess(res, list);
  } catch (error) {
    return sendError(res, 'Lỗi lấy danh sách nhân sự.', 500);
  }
};
