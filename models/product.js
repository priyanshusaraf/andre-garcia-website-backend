const pool = require('../config/db');

const Product = {
  async getAll() {
    const [rows] = await pool.query('SELECT * FROM products');
    return rows;
  },
  async getById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  },
  async create({ name, description, price, image_url, quality, size, stock }) {
    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, image_url, quality, size, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, price, image_url, quality, size, stock]
    );
    return { id: result.insertId, name, description, price, image_url, quality, size, stock };
  },
  async update(id, { name, description, price, image_url, quality, size, stock }) {
    await pool.query(
      'UPDATE products SET name=?, description=?, price=?, image_url=?, quality=?, size=?, stock=? WHERE id=?',
      [name, description, price, image_url, quality, size, stock, id]
    );
    return this.getById(id);
  },
  async remove(id) {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  }
};

module.exports = Product; 