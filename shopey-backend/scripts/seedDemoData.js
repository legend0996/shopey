require('dotenv').config();
const pool = require('../src/config/db');

const categories = ['Electronics', 'Fashion', 'Food', 'Beauty', 'Home', 'Sports'];

const shops = [
  { name: 'Nairobi Tech Hub', phone: '0712345678', paybill: '400001', location: 'Westlands, Nairobi' },
  { name: 'Urban Style KE', phone: '0723456789', paybill: '400002', location: 'CBD, Nairobi' },
  { name: 'Fresh Basket', phone: '0734567890', paybill: '400003', location: 'Kilimani, Nairobi' },
];

const products = [
  {
    name: 'Apple MacBook Air M2',
    category: 'Electronics',
    shop: 'Nairobi Tech Hub',
    description: '13-inch lightweight laptop with M2 chip, ideal for work and study.',
    price: 165000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1400&q=80',
    featured: true,
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    category: 'Electronics',
    shop: 'Nairobi Tech Hub',
    description: 'Premium wireless noise-cancelling headphones with all-day comfort.',
    price: 52000,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1400&q=80',
    featured: true,
  },
  {
    name: 'Minimalist White Sneakers',
    category: 'Fashion',
    shop: 'Urban Style KE',
    description: 'Clean everyday sneakers with a soft sole and breathable upper.',
    price: 6500,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Classic Denim Jacket',
    category: 'Fashion',
    shop: 'Urban Style KE',
    description: 'Timeless denim jacket with relaxed fit for casual layering.',
    price: 4800,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Organic Avocado Crate',
    category: 'Food',
    shop: 'Fresh Basket',
    description: 'Farm-fresh avocados carefully packed for weekly healthy meals.',
    price: 1800,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Premium Coffee Beans 1kg',
    category: 'Food',
    shop: 'Fresh Basket',
    description: 'Medium roast whole beans with rich aroma and chocolate notes.',
    price: 2200,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1400&q=80',
    featured: true,
  },
  {
    name: 'Hydrating Face Serum',
    category: 'Beauty',
    shop: 'Urban Style KE',
    description: 'Lightweight serum with hyaluronic acid for daily hydration.',
    price: 2400,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Matte Lipstick Set',
    category: 'Beauty',
    shop: 'Urban Style KE',
    description: 'Long-lasting matte shades curated for everyday and event looks.',
    price: 1900,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Modern Floor Lamp',
    category: 'Home',
    shop: 'Nairobi Tech Hub',
    description: 'Minimal standing lamp with warm light for cozy living spaces.',
    price: 7200,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Ceramic Dinnerware Set',
    category: 'Home',
    shop: 'Fresh Basket',
    description: '12-piece ceramic set with elegant neutral tones for modern homes.',
    price: 5600,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1612196808214-b7e239e5c8f5?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
  {
    name: 'Adjustable Dumbbell Pair',
    category: 'Sports',
    shop: 'Nairobi Tech Hub',
    description: 'Compact adjustable dumbbells perfect for home strength training.',
    price: 9800,
    stock: 16,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1400&q=80',
    featured: true,
  },
  {
    name: 'Yoga Mat Pro',
    category: 'Sports',
    shop: 'Urban Style KE',
    description: 'Non-slip yoga mat with extra cushioning and sweat resistance.',
    price: 2500,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1400&q=80',
    featured: false,
  },
];

async function getColumns(tableName) {
  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );

  return new Set(result.rows.map((row) => row.column_name));
}

async function tableExists(tableName) {
  const result = await pool.query(
    `SELECT to_regclass($1) AS regclass`,
    [`public.${tableName}`]
  );

  return Boolean(result.rows[0]?.regclass);
}

async function run() {
  console.log('Seeding demo data...');

  const productColumns = await getColumns('products');
  const hasProductImages = await tableExists('product_images');

  const categoryMap = new Map();
  for (const name of categories) {
    const existing = await pool.query(`SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1`, [name]);
    if (existing.rows.length) {
      categoryMap.set(name, existing.rows[0].id);
      continue;
    }

    const inserted = await pool.query(`INSERT INTO categories (name) VALUES ($1) RETURNING id`, [name]);
    categoryMap.set(name, inserted.rows[0].id);
  }

  const shopMap = new Map();
  for (const shop of shops) {
    const existing = await pool.query(`SELECT id FROM shops WHERE LOWER(name) = LOWER($1) LIMIT 1`, [shop.name]);
    if (existing.rows.length) {
      shopMap.set(shop.name, existing.rows[0].id);
      continue;
    }

    const inserted = await pool.query(
      `INSERT INTO shops (name, phone, paybill, location)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [shop.name, shop.phone, shop.paybill, shop.location]
    );
    shopMap.set(shop.name, inserted.rows[0].id);
  }

  for (const item of products) {
    const categoryId = categoryMap.get(item.category);
    const shopId = shopMap.get(item.shop);

    const existing = await pool.query(`SELECT id FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1`, [item.name]);
    let productId;

    if (existing.rows.length) {
      productId = existing.rows[0].id;

      await pool.query(
        `UPDATE products
         SET description = $1,
             price = $2,
             stock = $3,
             category_id = $4,
             shop_id = $5
         WHERE id = $6`,
        [item.description, item.price, item.stock, categoryId, shopId, productId]
      );
    } else {
      const countResult = await pool.query(`SELECT COUNT(*) FROM products`);
      const productCode = `PID-${String(Number(countResult.rows[0].count) + 1).padStart(3, '0')}`;

      const inserted = await pool.query(
        `INSERT INTO products
         (product_id, name, description, price, profit, weight, fragility, warranty, stock, category_id, shop_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          productCode,
          item.name,
          item.description,
          item.price,
          Math.round(item.price * 0.12),
          1,
          'medium',
          '6 months',
          item.stock,
          categoryId,
          shopId,
        ]
      );

      productId = inserted.rows[0].id;
    }

    if (productColumns.has('image')) {
      await pool.query(`UPDATE products SET image = $1 WHERE id = $2`, [item.image, productId]);
    }

    if (productColumns.has('is_featured')) {
      await pool.query(`UPDATE products SET is_featured = $1 WHERE id = $2`, [item.featured, productId]);
    }

    if (hasProductImages) {
      await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail)
         VALUES ($1, $2, TRUE)`,
        [productId, item.image]
      );
    }
  }

  console.log(`Seed complete: ${products.length} demo products ready.`);
}

run().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exit(1);
});
