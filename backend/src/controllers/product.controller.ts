import { Request, Response } from 'express';
import { db } from '../database/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProducts = (req: Request, res: Response) => {
  try {
    const { search, category_id, featured, all } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.code as category_code
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (all !== 'true') {
      query += ` AND p.is_active = 1 AND p.is_available = 1`;
    }

    if (category_id) {
      query += ` AND p.category_id = ?`;
      params.push(Number(category_id));
    }

    if (featured === 'true') {
      query += ` AND p.is_featured = 1`;
    }

    if (search && typeof search === 'string') {
      query += ` AND (p.name LIKE ? OR p.description LIKE ? OR p.code LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY p.is_featured DESC, p.id ASC`;

    const products = db.prepare(query).all(...params);
    return sendSuccess(res, products);
  } catch (error: any) {
    console.error('Lỗi lấy danh sách sản phẩm:', error);
    return sendError(res, 'Không thể tải danh sách sản phẩm.', 500);
  }
};

export const getProductById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = db.prepare(`
      SELECT p.*, c.name as category_name, c.code as category_code
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id) as any;

    if (!product) {
      return sendError(res, 'Không tìm thấy sản phẩm.', 404);
    }

    // Get recipe items for this product
    const recipe = db.prepare(`
      SELECT r.id, r.ingredient_id, r.required_quantity, i.name as ingredient_name, i.unit, i.current_stock
      FROM recipe_items r
      JOIN ingredients i ON r.ingredient_id = i.id
      WHERE r.product_id = ?
    `).all(id);

    product.recipe = recipe;

    return sendSuccess(res, product);
  } catch (error: any) {
    return sendError(res, 'Lỗi lấy chi tiết sản phẩm.', 500);
  }
};

export const createProduct = (req: Request, res: Response) => {
  try {
    const { code, category_id, name, description, ingredients_text, price, image_url, is_featured, recipe } = req.body;

    if (!code || !category_id || !name || price === undefined) {
      return sendError(res, 'Mã, danh mục, tên và giá là bắt buộc.', 400);
    }

    const result = db.prepare(`
      INSERT INTO products (code, category_id, name, description, ingredients_text, price, image_url, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      code.toUpperCase(),
      category_id,
      name,
      description || null,
      ingredients_text || null,
      Number(price),
      image_url || null,
      is_featured ? 1 : 0
    );

    const productId = Number(result.lastInsertRowid);

    // Save recipe items if provided
    if (Array.isArray(recipe) && recipe.length > 0) {
      const insertRecipe = db.prepare(`
        INSERT INTO recipe_items (product_id, ingredient_id, required_quantity)
        VALUES (?, ?, ?)
      `);
      for (const item of recipe) {
        if (item.ingredient_id && item.required_quantity > 0) {
          insertRecipe.run(productId, item.ingredient_id, item.required_quantity);
        }
      }
    }

    const newProd = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    return sendSuccess(res, newProd, 'Tạo món bánh mì mới thành công!', 201);
  } catch (error: any) {
    console.error('Lỗi tạo sản phẩm:', error);
    return sendError(res, 'Không thể tạo sản phẩm (vui lòng kiểm tra mã sản phẩm duy nhất).', 400);
  }
};

export const updateProduct = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { category_id, name, description, ingredients_text, price, image_url, is_available, is_featured, is_active, recipe } = req.body;

    db.prepare(`
      UPDATE products
      SET category_id = COALESCE(?, category_id),
          name = COALESCE(?, name),
          description = COALESCE(?, description),
          ingredients_text = COALESCE(?, ingredients_text),
          price = COALESCE(?, price),
          image_url = COALESCE(?, image_url),
          is_available = COALESCE(?, is_available),
          is_featured = COALESCE(?, is_featured),
          is_active = COALESCE(?, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      category_id,
      name,
      description,
      ingredients_text,
      price !== undefined ? Number(price) : null,
      image_url,
      is_available !== undefined ? (is_available ? 1 : 0) : null,
      is_featured !== undefined ? (is_featured ? 1 : 0) : null,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    );

    // If recipe is provided, replace recipe items
    if (Array.isArray(recipe)) {
      db.prepare('DELETE FROM recipe_items WHERE product_id = ?').run(id);
      const insertRecipe = db.prepare(`
        INSERT INTO recipe_items (product_id, ingredient_id, required_quantity)
        VALUES (?, ?, ?)
      `);
      for (const item of recipe) {
        if (item.ingredient_id && item.required_quantity > 0) {
          insertRecipe.run(id, item.ingredient_id, item.required_quantity);
        }
      }
    }

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return sendSuccess(res, updated, 'Cập nhật món thành công!');
  } catch (error: any) {
    return sendError(res, 'Lỗi cập nhật sản phẩm.', 500);
  }
};

export const deleteProduct = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Soft delete to protect historical order records
    db.prepare('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
    return sendSuccess(res, null, 'Đã ẩn sản phẩm khỏi thực đơn!');
  } catch (error: any) {
    return sendError(res, 'Lỗi khi xóa sản phẩm.', 500);
  }
};
