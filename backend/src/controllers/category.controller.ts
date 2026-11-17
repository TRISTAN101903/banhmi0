import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getCategories = (req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.id ASC
    `).all();

    return sendSuccess(res, categories);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy danh mục món ăn.', 500);
  }
};

export const createCategory = (req: Request, res: Response) => {
  try {
    const { code, name, description, display_order } = req.body;
    if (!code || !name) {
      return sendError(res, 'Mã và tên danh mục là bắt buộc.', 400);
    }

    const result = db.prepare(`
      INSERT INTO categories (code, name, description, display_order)
      VALUES (?, ?, ?, ?)
    `).run(code.toUpperCase(), name, description || null, display_order || 0);

    const newCat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return sendSuccess(res, newCat, 'Tạo danh mục thành công!', 201);
  } catch (error: any) {
    return sendError(res, 'Không thể tạo danh mục (có thể mã bị trùng lặp).', 400);
  }
};

export const updateCategory = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, display_order, is_active } = req.body;

    db.prepare(`
      UPDATE categories
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          display_order = COALESCE(?, display_order),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, description, display_order, is_active, id);

    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return sendSuccess(res, updated, 'Cập nhật danh mục thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật danh mục.', 500);
  }
};
