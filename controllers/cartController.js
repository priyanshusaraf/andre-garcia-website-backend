const Cart = require('../models/cart');

const getCart = async (req, res) => {
  try {
    let cart = await Cart.getCartByUserId(req.user.id);
    if (!cart) {
      cart = await Cart.createCart(req.user.id);
    }
    const items = await Cart.getCartItems(cart.id);
    res.json({ cart_id: cart.id, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
    let cart = await Cart.getCartByUserId(req.user.id);
    if (!cart) {
      cart = await Cart.createCart(req.user.id);
    }
    await Cart.addItem(cart.id, product_id, quantity);
    const items = await Cart.getCartItems(cart.id);
    res.json({ cart_id: cart.id, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (!product_id || !quantity) return res.status(400).json({ message: 'Product and quantity required' });
    let cart = await Cart.getCartByUserId(req.user.id);
    if (!cart) {
      cart = await Cart.createCart(req.user.id);
    }
    await Cart.updateItem(cart.id, product_id, quantity);
    const items = await Cart.getCartItems(cart.id);
    res.json({ cart_id: cart.id, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { product_id } = req.body;
    if (!product_id) return res.status(400).json({ message: 'Product required' });
    let cart = await Cart.getCartByUserId(req.user.id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    await Cart.removeItem(cart.id, product_id);
    const items = await Cart.getCartItems(cart.id);
    res.json({ cart_id: cart.id, items });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    let cart = await Cart.getCartByUserId(req.user.id);
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    await Cart.clearCart(cart.id);
    res.json({ cart_id: cart.id, items: [] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart }; 