const pool = require('../config/db');


// ✅ CREATE CATEGORY
exports.createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
      [name]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET CATEGORIES (for search dropdown)
exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM categories`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ CREATE PRODUCT
exports.createProduct = async (req, res) => {
  const {
    name,
    description,
    price,
    profit,
    weight,
    fragility,
    warranty,
    stock,
    category_id,
    shop_id,
    images
  } = req.body;

  try {
    // Generate PID
    const count = await pool.query(`SELECT COUNT(*) FROM products`);
    const product_id = `PID-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;

    const product = await pool.query(
      `INSERT INTO products 
      (product_id, name, description, price, profit, weight, fragility, warranty, stock, category_id, shop_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [product_id, name, description, price, profit, weight, fragility, warranty, stock, category_id, shop_id]
    );

    const productId = product.rows[0].id;

    // Insert images
    for (let img of images) {
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail)
         VALUES ($1, $2, $3)`,
        [productId, img.url, img.is_thumbnail]
      );
    }

    res.json({ message: 'Product created', product: product.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET ALL PRODUCTS (with filters)
exports.getProducts = async (req, res) => {
  const { minPrice, maxPrice } = req.query;

  try {
    let query = `
      SELECT p.*, c.name as category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const values = [];

    if (minPrice) {
      values.push(minPrice);
      query += ` AND p.price >= $${values.length}`;
    }

    if (maxPrice) {
      values.push(maxPrice);
      query += ` AND p.price <= $${values.length}`;
    }

    const result = await pool.query(query, values);

    res.json(result.rows);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await pool.query(
      `SELECT * FROM products WHERE id = $1`,
      [id]
    );

    const images = await pool.query(
      `SELECT * FROM product_images WHERE product_id = $1`,
      [id]
    );

    res.json({
      product: product.rows[0],
      images: images.rows
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ UPDATE PRODUCT
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    await pool.query(
      `UPDATE products
       SET name=$1, description=$2, price=$3, profit=$4,
           weight=$5, fragility=$6, warranty=$7,
           stock=$8, category_id=$9, shop_id=$10
       WHERE id=$11`,
      [
        data.name,
        data.description,
        data.price,
        data.profit,
        data.weight,
        data.fragility,
        data.warranty,
        data.stock,
        data.category_id,
        data.shop_id,
        id
      ]
    );

    res.json({ message: 'Product updated' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query(`DELETE FROM products WHERE id = $1`, [id]);
    res.json({ message: 'Product deleted' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 GET FEATURED PRODUCTS
exports.getFeaturedProducts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products WHERE is_featured=TRUE ORDER BY created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};