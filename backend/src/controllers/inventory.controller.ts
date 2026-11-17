import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { AuthRequest } from '../middlewares/auth.middleware.js';

export const getIngredients = (req: Request, res: Response) => {
  try {
    const ingredients = db.prepare(`
      SELECT *,
             (current_stock <= warning_threshold) as is_low_stock
      FROM ingredients
      ORDER BY is_low_stock DESC, name ASC
    `).all();

    return sendSuccess(res, ingredients);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy danh sách nguyên liệu.', 500);
  }
};

export const createIngredient = (req: Request, res: Response) => {
  try {
    const { code, name, unit, current_stock, warning_threshold, cost_price } = req.body;
    if (!code || !name || !unit) {
      return sendError(res, 'Mã, tên và đơn vị tính là bắt buộc.', 400);
    }

    const result = db.prepare(`
      INSERT INTO ingredients (code, name, unit, current_stock, warning_threshold, cost_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      code.toUpperCase(),
      name,
      unit,
      Number(current_stock || 0),
      Number(warning_threshold || 10),
      Number(cost_price || 0)
    );

    const newIng = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(result.lastInsertRowid);
    return sendSuccess(res, newIng, 'Thêm nguyên liệu thành công!', 201);
  } catch (error: any) {
    return sendError(res, 'Lỗi tạo nguyên liệu (kiểm tra mã duy nhất).', 400);
  }
};

export const updateIngredient = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, unit, warning_threshold, cost_price } = req.body;

    db.prepare(`
      UPDATE ingredients
      SET name = COALESCE(?, name),
          unit = COALESCE(?, unit),
          warning_threshold = COALESCE(?, warning_threshold),
          cost_price = COALESCE(?, cost_price),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, unit, warning_threshold, cost_price, id);

    const updated = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(id);
    return sendSuccess(res, updated, 'Cập nhật nguyên liệu thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật nguyên liệu.', 500);
  }
};

export const adjustStock = (req: AuthRequest, res: Response) => {
  try {
    const { ingredient_id, movement_type, quantity, reason } = req.body;

    if (!ingredient_id || !movement_type || quantity === undefined || !reason) {
      return sendError(res, 'Vui lòng cung cấp nguyên liệu, loại điều chỉnh, số lượng và lý do cụ thể.', 400);
    }

    const qty = Math.abs(Number(quantity));
    const ing = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ingredient_id) as any;
    if (!ing) {
      return sendError(res, 'Không tìm thấy nguyên liệu.', 404);
    }

    const prevStock = ing.current_stock;
    let newStock = prevStock;

    if (movement_type === 'IN') {
      newStock = prevStock + qty;
    } else if (movement_type === 'OUT') {
      newStock = Math.max(0, prevStock - qty);
    } else if (movement_type === 'ADJUST') {
      newStock = Number(quantity);
    } else {
      return sendError(res, 'Loại điều chỉnh không hợp lệ (IN, OUT, ADJUST).', 400);
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      db.prepare('UPDATE ingredients SET current_stock = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newStock, ing.id);

      db.prepare(`
        INSERT INTO inventory_movements (ingredient_id, order_id, movement_type, quantity, previous_stock, new_stock, reason)
        VALUES (?, NULL, ?, ?, ?, ?, ?)
      `).run(ing.id, movement_type, qty, prevStock, newStock, reason);

      db.exec('COMMIT;');

      const updated = db.prepare('SELECT * FROM ingredients WHERE id = ?').get(ing.id);
      return sendSuccess(res, updated, 'Điều chỉnh kho thành công!');
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (error: any) {
    return sendError(res, 'Lỗi điều chỉnh tồn kho.', 500);
  }
};

export const getMovements = (req: Request, res: Response) => {
  try {
    const { ingredient_id } = req.query;
    let query = `
      SELECT m.*, i.name as ingredient_name, i.unit, o.order_code
      FROM inventory_movements m
      JOIN ingredients i ON m.ingredient_id = i.id
      LEFT JOIN orders o ON m.order_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (ingredient_id) {
      query += ` AND m.ingredient_id = ?`;
      params.push(ingredient_id);
    }

    query += ` ORDER BY m.id DESC LIMIT 100`;

    const movements = db.prepare(query).all(...params);
    return sendSuccess(res, movements);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy lịch sử xuất nhập kho.', 500);
  }
};
