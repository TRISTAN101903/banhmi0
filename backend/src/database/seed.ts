import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db, initSchema } from './db.js';
import { config } from '../config/index.js';

export const seedDatabase = async () => {
  initSchema();

  console.log('[SEED] Khởi tạo dữ liệu nền tảng BÁNH MÌ 0...');

  // 1. Roles
  const roles = [
    { code: 'ADMIN', name: 'Quản trị viên', description: 'Toàn quyền điều hành hệ thống' },
    { code: 'STAFF', name: 'Nhân viên cửa hàng', description: 'Quản lý đơn hàng và sơ chế' },
    { code: 'SHIPPER', name: 'Nhân viên giao hàng', description: 'Xem đơn và cập nhật trạng thái giao' },
    { code: 'CUSTOMER', name: 'Khách hàng', description: 'Đặt bánh và theo dõi đơn' },
  ];

  const insertRoleStmt = db.prepare('INSERT OR IGNORE INTO roles (code, name, description) VALUES (?, ?, ?)');
  for (const r of roles) {
    insertRoleStmt.run(r.code, r.name, r.description);
  }

  // Helper to get role ID
  const getRoleId = (code: string): number => {
    const row = db.prepare('SELECT id FROM roles WHERE code = ?').get(code) as { id: number };
    return row.id;
  };

  const adminRoleId = getRoleId('ADMIN');
  const staffRoleId = getRoleId('STAFF');
  const shipperRoleId = getRoleId('SHIPPER');
  const customerRoleId = getRoleId('CUSTOMER');

  // 2. Initial Admin
  const adminExists = db.prepare('SELECT id FROM users WHERE email = ?').get(config.adminBootstrap.email);
  if (!adminExists) {
    const hashedAdminPass = await bcrypt.hash(config.adminBootstrap.password, 10);
    db.prepare(`
      INSERT INTO users (role_id, email, password_hash, full_name, phone, address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminRoleId,
      config.adminBootstrap.email,
      hashedAdminPass,
      config.adminBootstrap.name,
      config.adminBootstrap.phone,
      config.store.address
    );
    console.log(`[SEED] Đã tạo Admin: ${config.adminBootstrap.email}`);
    if (!config.adminBootstrap.passwordFromEnv && config.isProduction) {
      console.log(`[SEED] Mật khẩu admin ngẫu nhiên (chỉ hiện 1 lần, hãy đổi/đặt ADMIN_BOOTSTRAP_PASSWORD): ${config.adminBootstrap.password}`);
    }
  } else if (config.adminBootstrap.passwordFromEnv) {
    // Đồng bộ mật khẩu admin theo biến môi trường -> cách đổi mật khẩu admin cũ đã bị lộ trên DB đang chạy
    const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(config.adminBootstrap.email) as any;
    if (!(await bcrypt.compare(config.adminBootstrap.password, row.password_hash))) {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(await bcrypt.hash(config.adminBootstrap.password, 10), row.id);
      console.log('[SEED] Đã cập nhật mật khẩu admin theo ADMIN_BOOTSTRAP_PASSWORD.');
    }
  }

  // Khóa tài khoản admin mặc định cũ (mật khẩu đã từng công khai) khi đã chuyển sang email admin riêng
  const LEGACY_ADMIN = 'admin@banhmi0.vn';
  if (config.adminBootstrap.email !== LEGACY_ADMIN) {
    const legacy = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(LEGACY_ADMIN) as any;
    if (legacy && (await bcrypt.compare('BanhMi0@Admin2026!', legacy.password_hash))) {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
        .run(await bcrypt.hash(crypto.randomBytes(24).toString('base64url'), 10), legacy.id);
      console.log('[SEED] Đã khóa tài khoản admin mặc định cũ admin@banhmi0.vn.');
    }
  }

  // 3. Demo Shipper & Staff
  if (config.seedDemoAccounts) {
    const shipperExists = db.prepare('SELECT id FROM users WHERE email = ?').get('shipper@banhmi0.vn');
    if (!shipperExists) {
      const shipperPass = await bcrypt.hash('Shipper@123', 10);
      db.prepare(`
        INSERT INTO users (role_id, email, password_hash, full_name, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        shipperRoleId,
        'shipper@banhmi0.vn',
        shipperPass,
        'Nguyễn Văn Giao (Shipper BM0)',
        '0911223344',
        'Đội vận chuyển BÁNH MÌ 0'
      );
      console.log('[SEED] Đã tạo Shipper demo: shipper@banhmi0.vn (Mật khẩu: Shipper@123)');
    }

    const staffExists = db.prepare('SELECT id FROM users WHERE email = ?').get('staff@banhmi0.vn');
    if (!staffExists) {
      const staffPass = await bcrypt.hash('Staff@123', 10);
      db.prepare(`
        INSERT INTO users (role_id, email, password_hash, full_name, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        staffRoleId,
        'staff@banhmi0.vn',
        staffPass,
        'Trần Thị Bếp (Bếp Trưởng BM0)',
        '0922334455',
        'Quầy phục vụ BÁNH MÌ 0'
      );
      console.log('[SEED] Đã tạo Staff demo: staff@banhmi0.vn (Mật khẩu: Staff@123)');
    }
  } else {
    // Production: vô hiệu hóa các tài khoản demo cũ nếu còn dùng mật khẩu công khai trong README
    const demoAccounts = [['shipper@banhmi0.vn', 'Shipper@123'], ['staff@banhmi0.vn', 'Staff@123']];
    for (const [email, knownPass] of demoAccounts) {
      const row = db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(email) as any;
      if (row && (await bcrypt.compare(knownPass, row.password_hash))) {
        const randomPass = crypto.randomBytes(24).toString('base64url');
        db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await bcrypt.hash(randomPass, 10), row.id);
        console.log(`[SEED] Đã khóa tài khoản demo ${email} (đang dùng mật khẩu công khai). Admin hãy đặt mật khẩu mới nếu cần dùng.`);
      }
    }
  }

  // 4. Categories
  const categories = [
    { code: 'TRADITIONAL', name: 'Bánh Mì Truyền Thống', description: 'Hương vị cổ truyền gắn liền với ký ức ẩm thực Sài Gòn', display_order: 1 },
    { code: 'SIGNATURE', name: 'Đặc Biệt & Thịt Nướng', description: 'Dòng bánh mì thượng hạng đầy ắp nhân sốt độc quyền', display_order: 2 },
    { code: 'COMBO', name: 'Combo Bánh Mì & Nước', description: 'Lựa chọn trọn vẹn dinh dưỡng cho bữa sáng và trưa tràn đầy năng lượng', display_order: 3 },
  ];

  const insertCategoryStmt = db.prepare('INSERT OR IGNORE INTO categories (code, name, description, display_order) VALUES (?, ?, ?, ?)');
  for (const c of categories) {
    insertCategoryStmt.run(c.code, c.name, c.description, c.display_order);
  }

  const getCategoryId = (code: string): number => {
    const row = db.prepare('SELECT id FROM categories WHERE code = ?').get(code) as { id: number };
    return row.id;
  };

  const catTraditional = getCategoryId('TRADITIONAL');
  const catSignature = getCategoryId('SIGNATURE');
  const catCombo = getCategoryId('COMBO');

  // 5. Products (5 signature products)
  const products = [
    {
      code: 'BM-TRUNG',
      category_id: catTraditional,
      name: 'Bánh Mì Trứng Ốp La Giòn Tan',
      description: 'Hai quả trứng gà ốp la lòng đào nóng hổi, quyện cùng pate gan thơm béo, sốt bơ trứng vàng ngậy, dưa leo tươi giòn và rau ngò thơm nức mũi.',
      ingredients_text: 'Vỏ bánh mì giòn, 2 trứng gà ta, pate gan, sốt bơ trứng, dưa leo, ngò gai, nước tương ớt tỏi.',
      price: 25000,
      image_url: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
    },
    {
      code: 'BM-CHA',
      category_id: catTraditional,
      name: 'Bánh Mì Chả Lụa & Chả Quế Thượng Hạng',
      description: 'Chả lụa bì truyền thống thái lát dày dặn cùng chả quế nướng thơm ngậy, sốt tương ớt đậm đà, đồ chua cà rốt củ cải giòn sần sật.',
      ingredients_text: 'Vỏ bánh mì nướng, chả lụa hảo hạng, chả quế, pate gan, sốt mayonnaise gia truyền, đồ chua, ớt sừng.',
      price: 30000,
      image_url: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
    },
    {
      code: 'BM-THIT',
      category_id: catSignature,
      name: 'Bánh Mì Thịt Xá Xíu Rim Mật Ong',
      description: 'Thịt xá xíu đậm vị được rim lửa nhỏ cùng mật ong hoa rừng thơm lừng, thịt nguội jambon, sốt pate nướng bùi béo kết hợp hoàn hảo.',
      ingredients_text: 'Vỏ bánh mì, thịt xá xíu rim mật ong, thịt nguội, pate nướng, sốt bơ tươi, dưa chua, ớt xanh.',
      price: 35000,
      image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
    },
    {
      code: 'BM-DAC-BIET',
      category_id: catSignature,
      name: 'Bánh Mì Đặc Biệt BÁNH MÌ 0',
      description: 'Món Signature đỉnh cao của BÁNH MÌ 0! Ổ bánh đầy ụ nhân: chả lụa, xá xíu mật ong, thịt nguội giòn dai, pate gan hảo hạng, sốt trứng vàng ngậy độc quyền và sốt ớt cay nhẹ.',
      ingredients_text: 'Vỏ bánh mì đặc ruột giòn rụm, chả lụa, xá xíu, thịt nguội, pate gan đặc biệt, bơ trứng tươi, sốt gia truyền BÁNH MÌ 0, đồ chua, rau thơm.',
      price: 45000,
      image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
    },
    {
      code: 'COMBO-01',
      category_id: catCombo,
      name: 'Combo BÁNH MÌ 0 Tròn Vị + Trà Quất Mật Ong',
      description: 'Thưởng thức 01 Ổ Bánh Mì Đặc Biệt BÁNH MÌ 0 nóng hổi kèm 01 Ly Trà Quất Mật Ong mát lạnh sảng khoái, mang lại trải nghiệm chuẩn vị đường phố Việt.',
      ingredients_text: '01 Bánh Mì Đặc Biệt BÁNH MÌ 0 + 01 Ly Trà Quất Mật Ong tươi mát lạnh.',
      price: 55000,
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      is_featured: 1,
    },
  ];

  const insertProductStmt = db.prepare(`
    INSERT OR IGNORE INTO products (code, category_id, name, description, ingredients_text, price, image_url, is_featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of products) {
    insertProductStmt.run(p.code, p.category_id, p.name, p.description, p.ingredients_text, p.price, p.image_url, p.is_featured);
  }

  // 6. Ingredients
  const ingredients = [
    { code: 'ING-VO-BANH', name: 'Vỏ Bánh Mì Nóng Giòn', unit: 'ổ', current_stock: 250, warning_threshold: 30, cost_price: 3000 },
    { code: 'ING-TRUNG-GA', name: 'Trứng Gà Tươi', unit: 'quả', current_stock: 300, warning_threshold: 40, cost_price: 2500 },
    { code: 'ING-CHA-LUA', name: 'Chả Lụa Hảo Hạng', unit: 'kg', current_stock: 25.5, warning_threshold: 5, cost_price: 160000 },
    { code: 'ING-THIT-XA-XIU', name: 'Thịt Xá Xíu Rim Mật Ong', unit: 'kg', current_stock: 20.0, warning_threshold: 4, cost_price: 190000 },
    { code: 'ING-PATE-GAN', name: 'Pate Gan Gia Truyền', unit: 'kg', current_stock: 18.0, warning_threshold: 3, cost_price: 140000 },
    { code: 'ING-BO-TRUNG', name: 'Sốt Bơ Trứng Tươi', unit: 'kg', current_stock: 15.0, warning_threshold: 2.5, cost_price: 110000 },
    { code: 'ING-DUA-LEO', name: 'Dưa Leo Tươi', unit: 'kg', current_stock: 30.0, warning_threshold: 5, cost_price: 15000 },
    { code: 'ING-DO-CHUA', name: 'Đồ Chua (Cà Rốt & Củ Cải)', unit: 'kg', current_stock: 22.0, warning_threshold: 5, cost_price: 20000 },
    { code: 'ING-RAU-NGO', name: 'Rau Ngò & Hành Lá', unit: 'kg', current_stock: 12.0, warning_threshold: 2, cost_price: 25000 },
    { code: 'ING-NUOC-SOT', name: 'Nước Sốt Đậm Đà BÁNH MÌ 0', unit: 'lít', current_stock: 35.0, warning_threshold: 5, cost_price: 45000 },
    { code: 'ING-TRA-QUAT', name: 'Nguyên Liệu Trà Quất Mật Ong', unit: 'phần', current_stock: 150, warning_threshold: 20, cost_price: 6000 },
    { code: 'ING-BAO-BI', name: 'Túi Giấy & Hộp Kraft BÁNH MÌ 0', unit: 'cái', current_stock: 500, warning_threshold: 50, cost_price: 1200 },
  ];

  const insertIngStmt = db.prepare(`
    INSERT OR IGNORE INTO ingredients (code, name, unit, current_stock, warning_threshold, cost_price)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const ing of ingredients) {
    insertIngStmt.run(ing.code, ing.name, ing.unit, ing.current_stock, ing.warning_threshold, ing.cost_price);
  }

  // 7. Recipe Items (BOM - Bill of Materials)
  const getProdId = (code: string) => (db.prepare('SELECT id FROM products WHERE code = ?').get(code) as any).id;
  const getIngId = (code: string) => (db.prepare('SELECT id FROM ingredients WHERE code = ?').get(code) as any).id;

  const prodBanhMiDacBiet = getProdId('BM-DAC-BIET');
  const prodBanhMiTrung = getProdId('BM-TRUNG');
  const prodBanhMiCha = getProdId('BM-CHA');
  const prodBanhMiThit = getProdId('BM-THIT');
  const prodCombo01 = getProdId('COMBO-01');

  const recipes = [
    // Bánh mì đặc biệt
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-VO-BANH'), qty: 1 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-CHA-LUA'), qty: 0.05 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-THIT-XA-XIU'), qty: 0.05 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-PATE-GAN'), qty: 0.03 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-BO-TRUNG'), qty: 0.02 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-DUA-LEO'), qty: 0.03 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-DO-CHUA'), qty: 0.03 },
    { product_id: prodBanhMiDacBiet, ingredient_id: getIngId('ING-BAO-BI'), qty: 1 },

    // Bánh mì trứng
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-VO-BANH'), qty: 1 },
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-TRUNG-GA'), qty: 2 },
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-PATE-GAN'), qty: 0.025 },
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-BO-TRUNG'), qty: 0.02 },
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-DUA-LEO'), qty: 0.03 },
    { product_id: prodBanhMiTrung, ingredient_id: getIngId('ING-BAO-BI'), qty: 1 },

    // Bánh mì chả
    { product_id: prodBanhMiCha, ingredient_id: getIngId('ING-VO-BANH'), qty: 1 },
    { product_id: prodBanhMiCha, ingredient_id: getIngId('ING-CHA-LUA'), qty: 0.08 },
    { product_id: prodBanhMiCha, ingredient_id: getIngId('ING-PATE-GAN'), qty: 0.025 },
    { product_id: prodBanhMiCha, ingredient_id: getIngId('ING-DO-CHUA'), qty: 0.03 },
    { product_id: prodBanhMiCha, ingredient_id: getIngId('ING-BAO-BI'), qty: 1 },

    // Bánh mì thịt
    { product_id: prodBanhMiThit, ingredient_id: getIngId('ING-VO-BANH'), qty: 1 },
    { product_id: prodBanhMiThit, ingredient_id: getIngId('ING-THIT-XA-XIU'), qty: 0.08 },
    { product_id: prodBanhMiThit, ingredient_id: getIngId('ING-PATE-GAN'), qty: 0.025 },
    { product_id: prodBanhMiThit, ingredient_id: getIngId('ING-DO-CHUA'), qty: 0.03 },
    { product_id: prodBanhMiThit, ingredient_id: getIngId('ING-BAO-BI'), qty: 1 },

    // Combo 01
    { product_id: prodCombo01, ingredient_id: getIngId('ING-VO-BANH'), qty: 1 },
    { product_id: prodCombo01, ingredient_id: getIngId('ING-CHA-LUA'), qty: 0.05 },
    { product_id: prodCombo01, ingredient_id: getIngId('ING-THIT-XA-XIU'), qty: 0.05 },
    { product_id: prodCombo01, ingredient_id: getIngId('ING-TRA-QUAT'), qty: 1 },
    { product_id: prodCombo01, ingredient_id: getIngId('ING-BAO-BI'), qty: 1 },
  ];

  const insertRecipeStmt = db.prepare(`
    INSERT OR IGNORE INTO recipe_items (product_id, ingredient_id, required_quantity)
    VALUES (?, ?, ?)
  `);
  for (const r of recipes) {
    insertRecipeStmt.run(r.product_id, r.ingredient_id, r.qty);
  }

  // 8. Settings
  const settings = [
    { key: 'STORE_NAME', value: 'BÁNH MÌ 0', description: 'Tên thương hiệu' },
    { key: 'STORE_SLOGAN', value: 'TRÒN VỊ MỖI NGÀY – NÓNG GIÒN TỪNG Ổ', description: 'Khẩu hiệu thương hiệu' },
    { key: 'DESIGN_SIGNATURE', value: 'DESIGN BY TRISTAN.TEAMA4', description: 'Chữ ký bản quyền thiết kế' },
    { key: 'STORE_PHONE', value: '0987 654 321', description: 'Hotline đặt hàng' },
    { key: 'STORE_ADDRESS', value: '123 Đường Bánh Mì, Quận 1, TP. Hồ Chí Minh', description: 'Địa chỉ tiệm' },
    { key: 'STORE_HOURS', value: '06:00 - 21:00 hàng ngày', description: 'Thời gian mở cửa phục vụ' },
    { key: 'DELIVERY_BASE_FEE', value: '15000', description: 'Phí giao hàng cơ bản (VNĐ)' },
    { key: 'DELIVERY_FREE_THRESHOLD', value: '150000', description: 'Mức đơn miễn phí giao hàng (VNĐ)' },
    { key: 'STORE_LOGO_URL', value: '/logo_banhmi0.jpg', description: 'Ảnh đại diện/logo web và app' },
    { key: 'STORE_SHOWCASE_URL', value: '/store_showcase.jpg', description: 'Ảnh trưng bày cửa hàng BÁNH MÌ 0' },
    { key: 'STORE_CONCEPT_IMAGE_URL', value: '/store_showcase.jpg', description: 'Ảnh mục Trưng Bày Tiệm & Bao Bì (Concept Store)' },
  ];

  const insertSettingStmt = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, description)
    VALUES (?, ?, ?)
  `);
  for (const s of settings) {
    insertSettingStmt.run(s.key, s.value, s.description);
  }

  console.log('[SEED] Hoàn tất nạp dữ liệu mẫu ban đầu thành công!');
};

// If run directly
if (process.argv[1]?.includes('seed.ts')) {
  seedDatabase().catch(console.error);
}
