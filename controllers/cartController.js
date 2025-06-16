const Cart = require('../models/cart');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.getOrCreateByUserId(req.user.id);
    cart = await Cart.getById(cart.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
    let cart = await Cart.getOrCreateByUserId(req.user.id);
    await Cart.addItem(cart.id, product_id, quantity);
    cart = await Cart.getById(cart.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { item_id, quantity } = req.body;
    if (!item_id || !quantity) return res.status(400).json({ message: 'Item and quantity required' });
    await Cart.updateItem(item_id, quantity);
    let cart = await Cart.getOrCreateByUserId(req.user.id);
    cart = await Cart.getById(cart.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { item_id } = req.body;
    if (!item_id) return res.status(400).json({ message: 'Item required' });
    await Cart.removeItem(item_id);
    let cart = await Cart.getOrCreateByUserId(req.user.id);
    cart = await Cart.getById(cart.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart = await Cart.getOrCreateByUserId(req.user.id);
    await Cart.clearCart(cart.id);
    cart = await Cart.getById(cart.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart }; 