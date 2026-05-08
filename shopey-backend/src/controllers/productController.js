const pool = require('../config/db');

let productColumnsCache = null;
let productColumnsFetchedAt = 0;
let galleryColumnReady = false;
let productTablesCache = null;
let productTablesFetchedAt = 0;
let productImageColumnsCache = null;
let productImageColumnsFetchedAt = 0;

const CACHE_TTL_MS = 5 * 60 * 1000;

const parseBool = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return null;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

async function getProductColumns() {
  const now = Date.now();
  if (productColumnsCache && now - productColumnsFetchedAt < CACHE_TTL_MS) {
    return productColumnsCache;
  }

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'products'`
  );

  productColumnsCache = new Set(result.rows.map((row) => row.column_name));
  productColumnsFetchedAt = now;
  return productColumnsCache;
}

async function getProductTables() {
  const now = Date.now();
  if (productTablesCache && now - productTablesFetchedAt < CACHE_TTL_MS) {
    return productTablesCache;
  }

  const result = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public'`
  );

  productTablesCache = new Set(result.rows.map((row) => row.table_name));
  productTablesFetchedAt = now;
  return productTablesCache;
}

async function getProductImageColumns() {
  const now = Date.now();
  if (productImageColumnsCache && now - productImageColumnsFetchedAt < CACHE_TTL_MS) {
    return productImageColumnsCache;
  }

  const result = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'product_images'`
  );

  productImageColumnsCache = new Set(result.rows.map((row) => row.column_name));
  productImageColumnsFetchedAt = now;
  return productImageColumnsCache;
}

async function ensureGalleryOrderColumn() {
  if (galleryColumnReady) return;

  await pool.query(`ALTER TABLE product_images ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0`);
  galleryColumnReady = true;
}

const normalizeGallery = (gallery) => {
  if (!gallery) return [];
  if (Array.isArray(gallery)) return gallery;

  try {
    return JSON.parse(gallery);
  } catch (_err) {
    return [];
  }
};

const normalizeProduct = (row) => {
  const gallery = normalizeGallery(row.gallery).filter((item) => item?.url || item?.image_url);
  const normalizedGallery = gallery.map((item) => ({
    id: item.id,
    url: item.url || item.image_url,
    is_thumbnail: Boolean(item.is_thumbnail),
    order: item.display_order ?? item.order ?? 0,
  }));

  const thumbnail =
    normalizedGallery.find((image) => image.is_thumbnail) ||
    normalizedGallery[0] ||
    null;

  return {
    ...row,
    image: row.image || thumbnail?.url || null,
    featured: Boolean(row.is_featured),
    reviewCount: Number(row.review_count || 0),
    rating: Number(row.rating || 0),
    popularity: Number(row.popularity || 0),
    brand: row.brand || null,
    tags: Array.isArray(row.tags)
      ? row.tags
      : typeof row.tags === 'string'
        ? row.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [],
    thumbnail,
    gallery: normalizedGallery,
    images: normalizedGallery.map((img) => img.url),
  };
};

function buildProductFilters(query, values, columns, options = {}) {
  const hasReviews = Boolean(options.hasReviews);
  const whereParts = ['1=1'];
  const havingParts = [];

  const searchTerm = String(query.q || query.search || '').trim();
  if (searchTerm) {
    values.push(`%${searchTerm}%`);
    const searchIndex = values.length;

    const searchColumns = [
      `p.name ILIKE $${searchIndex}`,
      `p.description ILIKE $${searchIndex}`,
      `c.name ILIKE $${searchIndex}`,
    ];

    if (columns.has('tags')) {
      searchColumns.push(`array_to_string(p.tags, ' ') ILIKE $${searchIndex}`);
    }

    if (columns.has('brand')) {
      searchColumns.push(`p.brand ILIKE $${searchIndex}`);
    }

    whereParts.push(`(${searchColumns.join(' OR ')})`);
  }

  const category = String(query.category || '').trim();
  if (category && category.toLowerCase() !== 'all') {
    values.push(category);
    whereParts.push(`c.name ILIKE $${values.length}`);
  }

  const minPrice = parseNumber(query.minPrice);
  if (minPrice !== null) {
    values.push(minPrice);
    whereParts.push(`p.price >= $${values.length}`);
  }

  const maxPrice = parseNumber(query.maxPrice);
  if (maxPrice !== null) {
    values.push(maxPrice);
    whereParts.push(`p.price <= $${values.length}`);
  }

  const inStockValue = parseBool(query.inStock ?? query.availability);
  if (inStockValue === true) {
    whereParts.push(`p.stock > 0`);
  }
  if (inStockValue === false) {
    whereParts.push(`p.stock <= 0`);
  }

  const featured = parseBool(query.featured);
  if (featured !== null && columns.has('is_featured')) {
    whereParts.push(`p.is_featured = ${featured ? 'TRUE' : 'FALSE'}`);
  }

  const brand = String(query.brand || '').trim();
  if (brand && columns.has('brand')) {
    values.push(brand);
    whereParts.push(`p.brand ILIKE $${values.length}`);
  }

  const minRating = parseNumber(query.rating);
  if (minRating !== null && hasReviews) {
    values.push(minRating);
    havingParts.push(`COALESCE(AVG(r.rating), 0) >= $${values.length}`);
  }

  return {
    whereClause: whereParts.join(' AND '),
    havingClause: havingParts.length ? `HAVING ${havingParts.join(' AND ')}` : '',
  };
}

function getOrderBy(sort, newest, options = {}) {
  const hasReviews = Boolean(options.hasReviews);
  const hasOrderItems = Boolean(options.hasOrderItems);

  if (newest === true || sort === 'newest') {
    return 'p.created_at DESC NULLS LAST';
  }

  switch (sort) {
    case 'price_asc':
      return 'p.price ASC';
    case 'price_desc':
      return 'p.price DESC';
    case 'rating':
      if (!hasReviews) return 'p.created_at DESC NULLS LAST';
      return 'rating DESC, review_count DESC';
    case 'popularity':
      if (!hasOrderItems) return 'p.created_at DESC NULLS LAST';
      return 'popularity DESC';
    default:
      return 'p.created_at DESC NULLS LAST';
  }
}


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
    images,
    thumbnail,
    gallery,
    tags,
    brand,
    is_featured,
    featured,
    image,
  } = req.body;

  try {
    if (!name || !price || !category_id || !shop_id) {
      return res.status(400).json({ message: 'name, price, category_id and shop_id are required' });
    }

    const columns = await getProductColumns();

    // Generate PID
    const count = await pool.query(`SELECT COUNT(*) FROM products`);
    const product_id = `PID-${String(Number(count.rows[0].count) + 1).padStart(3, '0')}`;

    const insertColumns = [
      'product_id',
      'name',
      'description',
      'price',
      'profit',
      'weight',
      'fragility',
      'warranty',
      'stock',
      'category_id',
      'shop_id',
    ];

    const insertValues = [
      product_id,
      name,
      description || '',
      price,
      profit ?? 0,
      weight ?? 0,
      fragility || 'low',
      warranty || null,
      stock ?? 0,
      category_id,
      shop_id,
    ];

    if (columns.has('image')) {
      insertColumns.push('image');
      insertValues.push(image || thumbnail || null);
    }

    if (columns.has('is_featured')) {
      insertColumns.push('is_featured');
      insertValues.push(Boolean(featured ?? is_featured));
    }

    if (columns.has('tags')) {
      insertColumns.push('tags');
      insertValues.push(Array.isArray(tags) ? tags : []);
    }

    if (columns.has('brand')) {
      insertColumns.push('brand');
      insertValues.push(brand || null);
    }

    const placeholders = insertValues.map((_, index) => `$${index + 1}`).join(',');

    const product = await pool.query(
      `INSERT INTO products (${insertColumns.join(', ')})
       VALUES (${placeholders})
       RETURNING *`,
      insertValues
    );

    const productId = product.rows[0].id;

    await ensureGalleryOrderColumn();

    const normalizedImages = [
      ...(Array.isArray(images) ? images : []),
      ...(Array.isArray(gallery) ? gallery : []),
    ];

    let imageList = normalizedImages
      .map((img) => ({
        url: img?.url || img,
        is_thumbnail: Boolean(img?.is_thumbnail),
      }))
      .filter((img) => typeof img.url === 'string' && img.url.trim().length > 0);

    if (!imageList.length && thumbnail) {
      imageList = [{ url: thumbnail, is_thumbnail: true }];
    }

    if (imageList.length && !imageList.some((img) => img.is_thumbnail)) {
      imageList[0].is_thumbnail = true;
    }

    for (let index = 0; index < imageList.length; index += 1) {
      const img = imageList[index];
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail, display_order)
         VALUES ($1, $2, $3, $4)`,
        [productId, img.url, img.is_thumbnail, index]
      );
    }

    res.status(201).json({ message: 'Product created', product: product.rows[0] });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET ALL PRODUCTS (with filters)
exports.getProducts = async (req, res) => {
  try {
    const columns = await getProductColumns();
    const tables = await getProductTables();
    const imageColumns = await getProductImageColumns();
    const hasReviews = tables.has('reviews');
    const hasOrderItems = tables.has('order_items');
    const hasProductImages = tables.has('product_images');
    const hasImageThumbnail = imageColumns.has('is_thumbnail');
    const hasImageOrder = imageColumns.has('display_order');

    const values = [];
    const { whereClause, havingClause } = buildProductFilters(req.query, values, columns, { hasReviews });

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Math.max(1, Number(req.query.limit) || 12));
    const offset = (page - 1) * limit;

    const sort = String(req.query.sort || '').trim();
    const newest = parseBool(req.query.newest) === true;
    const orderBy = getOrderBy(sort, newest, { hasReviews, hasOrderItems });

    const reviewsJoin = hasReviews ? 'LEFT JOIN reviews r ON r.product_id = p.id' : '';
    const orderItemsJoin = hasOrderItems ? 'LEFT JOIN order_items oi ON oi.product_id = p.id' : '';
    const ratingSelect = hasReviews ? 'COALESCE(AVG(r.rating), 0)::FLOAT AS rating' : '0::FLOAT AS rating';
    const reviewCountSelect = hasReviews ? 'COUNT(DISTINCT r.id)::INT AS review_count' : '0::INT AS review_count';
    const popularitySelect = hasOrderItems ? 'COALESCE(SUM(oi.quantity), 0)::INT AS popularity' : '0::INT AS popularity';
    const imageThumbnailExpr = hasImageThumbnail ? 'pi.is_thumbnail' : 'FALSE';
    const imageOrderExpr = hasImageOrder ? 'COALESCE(pi.display_order, 0)' : '0';
    const gallerySelect = hasProductImages
      ? `COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.image_url,
                'is_thumbnail', ${imageThumbnailExpr},
                'display_order', ${imageOrderExpr}
              )
              ORDER BY ${imageOrderExpr}, pi.id
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::json
        ) AS gallery`
      : `'[]'::json AS gallery`;

    const countQuery = `
      SELECT COUNT(*)::INT AS total
      FROM (
        SELECT p.id
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        ${reviewsJoin}
        WHERE ${whereClause}
        GROUP BY p.id, c.name
        ${havingClause}
      ) matched
    `;

    const countResult = await pool.query(countQuery, values);
    const total = Number(countResult.rows[0]?.total || 0);

    const dataValues = [...values, limit, offset];
    const dataQuery = `
      SELECT
        p.*,
        c.name AS category,
        ${ratingSelect},
        ${reviewCountSelect},
        ${popularitySelect},
        ${gallerySelect}
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${reviewsJoin}
      ${orderItemsJoin}
      WHERE ${whereClause}
      GROUP BY p.id, c.name
      ${havingClause}
      ORDER BY ${orderBy}
      LIMIT $${dataValues.length - 1}
      OFFSET $${dataValues.length}
    `;

    const result = await pool.query(dataQuery, dataValues);
    const products = result.rows.map(normalizeProduct);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchProducts = async (req, res) => {
  req.query = {
    ...req.query,
    q: String(req.query.q || req.query.search || ''),
  };

  return exports.getProducts(req, res);
};

exports.getSearchSuggestions = async (req, res) => {
  const q = String(req.query.q || '').trim();
  const limit = Math.min(10, Math.max(1, Number(req.query.limit) || 8));

  if (!q) {
    return res.json({ suggestions: [] });
  }

  try {
    const columns = await getProductColumns();
    const tables = await getProductTables();
    const imageColumns = await getProductImageColumns();
    const hasProductImages = tables.has('product_images');
    const hasImageThumbnail = imageColumns.has('is_thumbnail');
    const hasImageOrder = imageColumns.has('display_order');
    const whereParts = [
      `p.name ILIKE $1`,
      `c.name ILIKE $1`,
      `p.description ILIKE $1`,
    ];

    if (columns.has('tags')) {
      whereParts.push(`array_to_string(p.tags, ' ') ILIKE $1`);
    }

    if (columns.has('brand')) {
      whereParts.push(`p.brand ILIKE $1`);
    }

    const featuredOrder = columns.has('is_featured') ? 'p.is_featured DESC,' : '';
    const imageOrderBy = `${hasImageThumbnail ? 'pi.is_thumbnail DESC,' : ''} ${hasImageOrder ? 'COALESCE(pi.display_order, 0),' : ''} pi.id`;

    const imageSelect = hasProductImages
      ? `COALESCE(
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY ${imageOrderBy}
            LIMIT 1
          ),
          p.image
        ) AS image`
      : `p.image`;

    const result = await pool.query(
      `SELECT
        p.id,
        p.name,
        c.name AS category,
        ${imageSelect}
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereParts.join(' OR ')}
      ORDER BY ${featuredOrder} p.created_at DESC NULLS LAST
      LIMIT $2`,
      [`%${q}%`, limit]
    );

    res.json({ suggestions: result.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ✅ GET SINGLE PRODUCT
exports.getSingleProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const tables = await getProductTables();
    const imageColumns = await getProductImageColumns();
    const hasReviews = tables.has('reviews');
    const hasProductImages = tables.has('product_images');
    const hasImageThumbnail = imageColumns.has('is_thumbnail');
    const hasImageOrder = imageColumns.has('display_order');
    const reviewsJoin = hasReviews ? 'LEFT JOIN reviews r ON r.product_id = p.id' : '';
    const ratingSelect = hasReviews ? 'COALESCE(AVG(r.rating), 0)::FLOAT AS rating' : '0::FLOAT AS rating';
    const reviewCountSelect = hasReviews ? 'COUNT(DISTINCT r.id)::INT AS review_count' : '0::INT AS review_count';
    const imageThumbnailExpr = hasImageThumbnail ? 'pi.is_thumbnail' : 'FALSE';
    const imageOrderExpr = hasImageOrder ? 'COALESCE(pi.display_order, 0)' : '0';
    const gallerySelect = hasProductImages
      ? `COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.image_url,
                'is_thumbnail', ${imageThumbnailExpr},
                'display_order', ${imageOrderExpr}
              )
              ORDER BY ${imageOrderExpr}, pi.id
            )
            FROM product_images pi
            WHERE pi.product_id = p.id
          ),
          '[]'::json
        ) AS gallery`
      : `'[]'::json AS gallery`;

    const product = await pool.query(
      `SELECT
        p.*,
        c.name AS category,
        ${ratingSelect},
        ${reviewCountSelect},
        ${gallerySelect}
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${reviewsJoin}
      WHERE p.id = $1
      GROUP BY p.id, c.name`,
      [id]
    );

    if (!product.rows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const normalized = normalizeProduct(product.rows[0]);

    res.json({
      product: normalized,
      images: normalized.gallery,
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
    const columns = await getProductColumns();

    const updates = [
      ['name', data.name],
      ['description', data.description],
      ['price', data.price],
      ['profit', data.profit],
      ['weight', data.weight],
      ['fragility', data.fragility],
      ['warranty', data.warranty],
      ['stock', data.stock],
      ['category_id', data.category_id],
      ['shop_id', data.shop_id],
      ['image', data.image || data.thumbnail],
      ['is_featured', data.featured ?? data.is_featured],
      ['tags', Array.isArray(data.tags) ? data.tags : undefined],
      ['brand', data.brand],
    ].filter(([column, value]) => columns.has(column) && value !== undefined);

    if (!updates.length) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const setClause = updates.map(([column], index) => `${column}=$${index + 1}`).join(', ');
    const values = updates.map(([, value]) => value);
    values.push(id);

    await pool.query(`UPDATE products SET ${setClause} WHERE id=$${values.length}`, values);

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
    const columns = await getProductColumns();
    const tables = await getProductTables();
    const imageColumns = await getProductImageColumns();
    const hasProductImages = tables.has('product_images');
    const hasImageThumbnail = imageColumns.has('is_thumbnail');
    const hasImageOrder = imageColumns.has('display_order');
    const whereFeatured = columns.has('is_featured') ? 'WHERE p.is_featured = TRUE' : '';
    const imageOrderBy = `${hasImageThumbnail ? 'pi.is_thumbnail DESC,' : ''} ${hasImageOrder ? 'COALESCE(pi.display_order, 0),' : ''} pi.id`;
    const imageSelect = hasProductImages
      ? `COALESCE(
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY ${imageOrderBy}
            LIMIT 1
          ),
          p.image
        ) AS image`
      : 'p.image';

    const result = await pool.query(
      `SELECT
        p.*,
        c.name AS category,
        ${imageSelect}
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereFeatured}
      ORDER BY p.created_at DESC`
    );

    res.json(result.rows.map(normalizeProduct));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.replaceGallery = async (req, res) => {
  const { id } = req.params;
  const { images = [] } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'images must be a non-empty array' });
  }

  try {
    await ensureGalleryOrderColumn();

    const normalized = images
      .map((item) => ({
        url: typeof item === 'string' ? item : item?.url,
        is_thumbnail: Boolean(item?.is_thumbnail),
      }))
      .filter((item) => typeof item.url === 'string' && item.url.trim().length > 0);

    if (!normalized.length) {
      return res.status(400).json({ message: 'At least one valid image URL is required' });
    }

    if (!normalized.some((item) => item.is_thumbnail)) {
      normalized[0].is_thumbnail = true;
    }

    await pool.query(`DELETE FROM product_images WHERE product_id = $1`, [id]);

    for (let index = 0; index < normalized.length; index += 1) {
      const image = normalized[index];
      await pool.query(
        `INSERT INTO product_images (product_id, image_url, is_thumbnail, display_order)
         VALUES ($1, $2, $3, $4)`,
        [id, image.url, image.is_thumbnail, index]
      );
    }

    const thumbnail = normalized.find((item) => item.is_thumbnail) || normalized[0];
    await pool.query(`UPDATE products SET image = $1 WHERE id = $2`, [thumbnail.url, id]);

    res.json({ message: 'Gallery updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.reorderGallery = async (req, res) => {
  const { id } = req.params;
  const { imageIds } = req.body;

  if (!Array.isArray(imageIds) || !imageIds.length) {
    return res.status(400).json({ message: 'imageIds must be a non-empty array' });
  }

  try {
    await ensureGalleryOrderColumn();

    for (let index = 0; index < imageIds.length; index += 1) {
      await pool.query(
        `UPDATE product_images
         SET display_order = $1
         WHERE id = $2 AND product_id = $3`,
        [index, imageIds[index], id]
      );
    }

    res.json({ message: 'Gallery order updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.setThumbnail = async (req, res) => {
  const { id } = req.params;
  const { imageId } = req.body;

  if (!imageId) {
    return res.status(400).json({ message: 'imageId is required' });
  }

  try {
    await pool.query(`UPDATE product_images SET is_thumbnail = FALSE WHERE product_id = $1`, [id]);
    const result = await pool.query(
      `UPDATE product_images
       SET is_thumbnail = TRUE
       WHERE id = $1 AND product_id = $2
       RETURNING image_url`,
      [imageId, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    await pool.query(`UPDATE products SET image = $1 WHERE id = $2`, [result.rows[0].image_url, id]);
    res.json({ message: 'Thumbnail updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteGalleryImage = async (req, res) => {
  const { id, imageId } = req.params;

  try {
    const removed = await pool.query(
      `DELETE FROM product_images WHERE id = $1 AND product_id = $2 RETURNING is_thumbnail`,
      [imageId, id]
    );

    if (!removed.rows.length) {
      return res.status(404).json({ message: 'Image not found' });
    }

    if (removed.rows[0].is_thumbnail) {
      const fallback = await pool.query(
        `SELECT id, image_url
         FROM product_images
         WHERE product_id = $1
         ORDER BY COALESCE(display_order, 0), id
         LIMIT 1`,
        [id]
      );

      if (fallback.rows.length) {
        await pool.query(`UPDATE product_images SET is_thumbnail = TRUE WHERE id = $1`, [fallback.rows[0].id]);
        await pool.query(`UPDATE products SET image = $1 WHERE id = $2`, [fallback.rows[0].image_url, id]);
      } else {
        await pool.query(`UPDATE products SET image = NULL WHERE id = $1`, [id]);
      }
    }

    res.json({ message: 'Image removed from gallery' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};