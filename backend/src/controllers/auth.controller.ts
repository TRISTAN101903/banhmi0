import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { hashPassword, comparePassword, signToken } from '../utils/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const register = async (req: Request, res: Response) => {
  try {
    const { password, full_name, phone, address } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || typeof password !== 'string' || typeof full_name !== 'string' || !full_name.trim()) {
      return sendError(res, 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên.', 400);
    }

    if (!EMAIL_RE.test(email) || email.length > 120) {
      return sendError(res, 'Email không hợp lệ.', 400);
    }

    if (password.length < 6 || password.length > 72) {
      return sendError(res, 'Mật khẩu phải từ 6 đến 72 ký tự.', 400);
    }

    if (full_name.length > 100 || (phone && String(phone).length > 20) || (address && String(address).length > 300)) {
      return sendError(res, 'Thông tin cá nhân quá dài.', 400);
    }

    // Check if email already exists
    const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email);
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
    const password = req.body.password;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || typeof password !== 'string' || !password) {
      return sendError(res, 'Vui lòng nhập email và mật khẩu.', 400);
    }

    const user = db.prepare(`
      SELECT u.id, u.email, u.password_hash, u.full_name, u.phone, u.address, r.code as role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE lower(u.email) = ?
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

// Admin tạo tài khoản dành riêng cho Shipper (không có đường đăng ký công khai cho Shipper)
export const createShipper = async (req: AuthRequest, res: Response) => {
  try {
    const { password, full_name, phone } = req.body;
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';

    if (!email || typeof password !== 'string' || typeof full_name !== 'string' || !full_name.trim()) {
      return sendError(res, 'Vui lòng nhập đầy đủ email, mật khẩu và họ tên shipper.', 400);
    }
    if (!EMAIL_RE.test(email) || email.length > 120) {
      return sendError(res, 'Email không hợp lệ.', 400);
    }
    if (password.length < 8 || password.length > 72) {
      return sendError(res, 'Mật khẩu shipper phải từ 8 đến 72 ký tự.', 400);
    }
    if (full_name.length > 100 || (phone && String(phone).length > 20)) {
      return sendError(res, 'Thông tin quá dài.', 400);
    }

    const existing = db.prepare('SELECT id FROM users WHERE lower(email) = ?').get(email);
    if (existing) {
      return sendError(res, 'Email này đã được sử dụng.', 409);
    }

    const role = db.prepare("SELECT id FROM roles WHERE code = 'SHIPPER'").get() as { id: number };
    const hash = await hashPassword(password);
    const result = db.prepare(`
      INSERT INTO users (role_id, email, password_hash, full_name, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(role.id, email, hash, full_name.trim(), phone ? String(phone).trim() : null);

    return sendSuccess(res, {
      id: Number(result.lastInsertRowid),
      email,
      full_name: full_name.trim(),
      phone: phone || null,
      role: 'SHIPPER',
    }, 'Đã tạo tài khoản Shipper!', 201);
  } catch (error: any) {
    console.error('Lỗi tạo shipper:', error);
    return sendError(res, 'Không thể tạo tài khoản shipper.', 500);
  }
};

// Admin đặt lại mật khẩu cho Shipper
export const resetShipperPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return sendError(res, 'Mật khẩu mới phải từ 8 đến 72 ký tự.', 400);
    }
    const target = db.prepare(`
      SELECT u.id FROM users u JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND r.code = 'SHIPPER'
    `).get(id);
    if (!target) {
      return sendError(res, 'Không tìm thấy tài khoản Shipper.', 404);
    }
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(await hashPassword(password), id);
    return sendSuccess(res, null, 'Đã đặt lại mật khẩu Shipper.');
  } catch (error: any) {
    return sendError(res, 'Lỗi đặt lại mật khẩu.', 500);
  }
};
