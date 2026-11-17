import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, requireRoles } from '../middlewares/auth.middleware.js';
import { sendSuccess, sendError } from '../utils/response.js';

import { config } from '../config/index.js';

const router = Router();

const uploadDir = path.resolve(config.uploadsDir, 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Chỉ chấp nhận các định dạng ảnh: JPEG, JPG, PNG, WEBP.'));
  }
});

router.post('/', authenticate, requireRoles('ADMIN', 'STAFF'), upload.single('image'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return sendError(res, 'Vui lòng chọn file hình ảnh hợp lệ.', 400);
    }

    const fileUrl = `/uploads/products/${req.file.filename}`;
    return sendSuccess(res, {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    }, 'Tải ảnh sản phẩm lên thành công!');
  } catch (error: any) {
    return sendError(res, error.message || 'Lỗi tải ảnh lên máy chủ.', 500);
  }
});

export default router;
