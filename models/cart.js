const pool = require('../config/db');

const Cart = {
  async getCartByUserId(user_id) {
    const [rows] = await pool.query('SELECT * FROM carts WHERE user_id = ?', [user_id]);
    return rows[0];
  },
  async createCart(user_id) {
    const [result] = await pool.query('INSERT INTO carts (user_id) VALUES (?)', [user_id]);
    return { id: result.insertId, user_id };
  },
  async getCartItems(cart_id) {
    const [rows] = await pool.query(
      `SELECT ci.id, ci.quantity, p.* FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?`,
      [cart_id]
    );
    return rows;
  },
  async addItem(cart_id, product_id, quantity) {
    // Check if item exists
    const [rows] = await pool.query('SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart_id, product_id]);
    if (rows.length > 0) {
      await pool.query('UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?', [quantity, cart_id, product_id]);
    } else {
      await pool.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart_id, product_id, quantity]);
    }
    return true;
  },
  async updateItem(cart_id, product_id, quantity) {
    await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?', [quantity, cart_id, product_id]);
    return true;
  },
  async removeItem(cart_id, product_id) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?', [cart_id, product_id]);
    return true;
  },
  async clearCart(cart_id) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);
    return true;
  }
};

module.exports = Cart; 