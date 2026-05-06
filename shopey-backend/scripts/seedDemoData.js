require('dotenv').config();
const pool = require('../src/config/db');
const bcrypt = require('bcrypt');

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

const demoUsers = [
  { email: 'alice.demo@shopey.co.ke', phone: '0711000001', password: 'User@1234' },
  { email: 'brian.demo@shopey.co.ke', phone: '0711000002', password: 'User@1234' },
  { email: 'carol.demo@shopey.co.ke', phone: '0711000003', password: 'User@1234' },
];

const demoRiders = [
  { name: 'Kevin Rider', phone: '0799000001', password: 'Rider@1234' },
  { name: 'Martha Rider', phone: '0799000002', password: 'Rider@1234' },
];

const demoReviews = [
  { product: 'Apple MacBook Air M2', rating: 5, comment: 'Excellent performance and battery life.' },
  { product: 'Sony WH-1000XM5 Headphones', rating: 5, comment: 'Noise cancellation is top tier.' },
  { product: 'Minimalist White Sneakers', rating: 4, comment: 'Very comfortable for daily wear.' },
  { product: 'Hydrating Face Serum', rating: 4, comment: 'Light texture and good hydration.' },
  { product: 'Yoga Mat Pro', rating: 5, comment: 'Great grip and cushioning.' },
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

async function seedUsers() {
  if (!(await tableExists('users'))) {
    console.log('Skipping users: table not found');
    return [];
  }

  const columns = await getColumns('users');
  if (!columns.has('email') || !columns.has('phone') || !columns.has('password')) {
    console.log('Skipping users: required columns missing');
    return [];
  }

  const userIds = [];

  for (const user of demoUsers) {
    const existing = await pool.query(`SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1`, [user.email]);
    const hashed = await bcrypt.hash(user.password, 10);

    if (existing.rows.length) {
      const id = existing.rows[0].id;
      await pool.query(`UPDATE users SET phone = $1, password = $2 WHERE id = $3`, [user.phone, hashed, id]);

      if (columns.has('is_verified')) {
        await pool.query(`UPDATE users SET is_verified = TRUE WHERE id = $1`, [id]);
      }

      userIds.push(id);
      continue;
    }

    const insertCols = ['email', 'phone', 'password'];
    const insertVals = [user.email, user.phone, hashed];

    if (columns.has('is_verified')) {
      insertCols.push('is_verified');
      insertVals.push(true);
    }

    const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
    const inserted = await pool.query(
      `INSERT INTO users (${insertCols.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      insertVals
    );

    userIds.push(inserted.rows[0].id);
  }

  return userIds;
}

async function seedRiders() {
  if (!(await tableExists('riders'))) {
    console.log('Skipping riders: table not found');
    return [];
  }

  const columns = await getColumns('riders');
  if (!columns.has('phone') || !columns.has('password')) {
    console.log('Skipping riders: required columns missing');
    return [];
  }

  const riderIds = [];

  for (const rider of demoRiders) {
    const existing = await pool.query(`SELECT id FROM riders WHERE phone = $1 LIMIT 1`, [rider.phone]);
    const hashed = await bcrypt.hash(rider.password, 10);

    if (existing.rows.length) {
      const id = existing.rows[0].id;
      await pool.query(`UPDATE riders SET password = $1 WHERE id = $2`, [hashed, id]);

      if (columns.has('name')) {
        await pool.query(`UPDATE riders SET name = $1 WHERE id = $2`, [rider.name, id]);
      }

      riderIds.push(id);
      continue;
    }

    const insertCols = [];
    const insertVals = [];

    if (columns.has('name')) {
      insertCols.push('name');
      insertVals.push(rider.name);
    }

    insertCols.push('phone', 'password');
    insertVals.push(rider.phone, hashed);

    const placeholders = insertVals.map((_, i) => `$${i + 1}`).join(', ');
    const inserted = await pool.query(
      `INSERT INTO riders (${insertCols.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      insertVals
    );

    riderIds.push(inserted.rows[0].id);
  }

  return riderIds;
}

async function seedOrdersAndDeliveries(userIds, riderIds, productIdsByName) {
  const hasOrders = await tableExists('orders');
  const hasOrderItems = await tableExists('order_items');
  const hasDeliveries = await tableExists('deliveries');

  if (!hasOrders || !hasOrderItems) {
    console.log('Skipping orders: orders/order_items tables not found');
    return;
  }

  if (!userIds.length) {
    console.log('Skipping orders: no demo users available');
    return;
  }

  const ordersColumns = await getColumns('orders');
  const deliveriesColumns = hasDeliveries ? await getColumns('deliveries') : new Set();

  const selectedProducts = [
    ['Apple MacBook Air M2', 1],
    ['Minimalist White Sneakers', 2],
    ['Yoga Mat Pro', 1],
  ]
    .map(([name, quantity]) => ({ productId: productIdsByName.get(name), quantity }))
    .filter((item) => Boolean(item.productId));

  if (!selectedProducts.length) {
    console.log('Skipping orders: no products found for order seed');
    return;
  }

  const orderCode = `DEMO-${Date.now()}`;
  const userId = userIds[0];

  let total = 0;
  for (const item of selectedProducts) {
    const p = await pool.query(`SELECT price FROM products WHERE id = $1`, [item.productId]);
    total += Number(p.rows[0]?.price || 0) * item.quantity;
  }

  const orderCols = [];
  const orderVals = [];

  if (ordersColumns.has('order_code')) {
    orderCols.push('order_code');
    orderVals.push(orderCode);
  }
  if (ordersColumns.has('user_id')) {
    orderCols.push('user_id');
    orderVals.push(userId);
  }
  if (ordersColumns.has('total_amount')) {
    orderCols.push('total_amount');
    orderVals.push(total);
  }
  if (ordersColumns.has('delivery_fee')) {
    orderCols.push('delivery_fee');
    orderVals.push(250);
  }
  if (ordersColumns.has('final_amount')) {
    orderCols.push('final_amount');
    orderVals.push(total + 250);
  }
  if (ordersColumns.has('county')) {
    orderCols.push('county');
    orderVals.push('Nairobi');
  }
  if (ordersColumns.has('town')) {
    orderCols.push('town');
    orderVals.push('Westlands');
  }
  if (ordersColumns.has('description')) {
    orderCols.push('description');
    orderVals.push('Demo order for dashboard previews');
  }
  if (ordersColumns.has('status')) {
    orderCols.push('status');
    orderVals.push('processing');
  }

  const existing = await pool.query(`SELECT id FROM orders WHERE order_code = $1 LIMIT 1`, [orderCode]);
  let orderId;

  if (existing.rows.length) {
    orderId = existing.rows[0].id;
  } else {
    const placeholders = orderVals.map((_, i) => `$${i + 1}`).join(', ');
    const inserted = await pool.query(
      `INSERT INTO orders (${orderCols.join(', ')}) VALUES (${placeholders}) RETURNING id`,
      orderVals
    );
    orderId = inserted.rows[0].id;
  }

  await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [orderId]);

  for (const item of selectedProducts) {
    const p = await pool.query(`SELECT price FROM products WHERE id = $1`, [item.productId]);
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, price)
       VALUES ($1, $2, $3, $4)`,
      [orderId, item.productId, item.quantity, Number(p.rows[0]?.price || 0)]
    );
  }

  if (await tableExists('order_shops')) {
    await pool.query(`DELETE FROM order_shops WHERE order_id = $1`, [orderId]);
    const shopsRes = await pool.query(
      `SELECT DISTINCT p.shop_id
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [orderId]
    );

    for (const row of shopsRes.rows) {
      await pool.query(`INSERT INTO order_shops (order_id, shop_id) VALUES ($1, $2)`, [orderId, row.shop_id]);
    }
  }

  if (hasDeliveries && riderIds.length && deliveriesColumns.has('order_id') && deliveriesColumns.has('rider_id')) {
    const deliveryStatus = deliveriesColumns.has('status') ? 'assigned' : null;
    const existingDelivery = await pool.query(`SELECT id FROM deliveries WHERE order_id = $1 LIMIT 1`, [orderId]);

    if (existingDelivery.rows.length) {
      const deliveryId = existingDelivery.rows[0].id;
      await pool.query(`UPDATE deliveries SET rider_id = $1${deliveryStatus ? ', status = $2' : ''} WHERE id = $${deliveryStatus ? '3' : '2'}`,
        deliveryStatus ? [riderIds[0], deliveryStatus, deliveryId] : [riderIds[0], deliveryId]);
    } else {
      const cols = ['order_id', 'rider_id'];
      const vals = [orderId, riderIds[0]];

      if (deliveriesColumns.has('status')) {
        cols.push('status');
        vals.push('assigned');
      }
      if (deliveriesColumns.has('assigned_at')) {
        cols.push('assigned_at');
        vals.push(new Date());
      }

      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ');
      await pool.query(`INSERT INTO deliveries (${cols.join(', ')}) VALUES (${placeholders})`, vals);
    }
  }
}

async function seedReviews(userIds, productIdsByName) {
  if (!(await tableExists('reviews'))) {
    console.log('Skipping reviews: table not found');
    return;
  }

  if (!userIds.length) {
    console.log('Skipping reviews: no demo users available');
    return;
  }

  for (let index = 0; index < demoReviews.length; index += 1) {
    const review = demoReviews[index];
    const productId = productIdsByName.get(review.product);
    if (!productId) continue;

    const userId = userIds[index % userIds.length];

    const existing = await pool.query(
      `SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2 LIMIT 1`,
      [userId, productId]
    );

    if (existing.rows.length) {
      await pool.query(
        `UPDATE reviews SET rating = $1, comment = $2 WHERE id = $3`,
        [review.rating, review.comment, existing.rows[0].id]
      );
      continue;
    }

    await pool.query(
      `INSERT INTO reviews (user_id, product_id, rating, comment)
       VALUES ($1, $2, $3, $4)`,
      [userId, productId, review.rating, review.comment]
    );
  }
}

async function run() {
  console.log('Seeding demo data...');

  const productColumns = await getColumns('products');
  const hasProductImages = await tableExists('product_images');
  const productImageColumns = hasProductImages ? await getColumns('product_images') : new Set();
  const productIdsByName = new Map();

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
      const imageCols = ['product_id', 'image_url'];
      const imageVals = [productId, item.image];

      if (productImageColumns.has('is_thumbnail')) {
        imageCols.push('is_thumbnail');
        imageVals.push(true);
      }

      const imagePlaceholders = imageVals.map((_, i) => `$${i + 1}`).join(', ');
      await pool.query(
        `INSERT INTO product_images (${imageCols.join(', ')}) VALUES (${imagePlaceholders})`,
        imageVals
      );
    }

    productIdsByName.set(item.name, productId);
  }

  const userIds = await seedUsers();
  const riderIds = await seedRiders();
  await seedOrdersAndDeliveries(userIds, riderIds, productIdsByName);
  await seedReviews(userIds, productIdsByName);

  console.log(`Seed complete: ${products.length} demo products + users/orders/reviews where supported.`);
}

run().catch((error) => {
  console.error('Demo seed failed:', error.message);
  process.exit(1);
});
