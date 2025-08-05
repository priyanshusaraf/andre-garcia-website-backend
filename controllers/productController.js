const Product = require('../models/product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.getAll();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, quality, size, stock } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price are required' });
    const product = await Product.create({ name, description, price, image_url, quality, size, stock });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, description, price, image_url, quality, size, stock } = req.body;
    const product = await Product.update(req.params.id, { name, description, price, image_url, quality, size, stock });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    await Product.remove(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    // Return first 3 products as featured for now
    const products = await Product.getAll();
    const featuredProducts = products.slice(0, 3);
    res.json(featuredProducts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getHeroImages = async (req, res) => {
  try {
    const AdminSettings = require('../models/adminSettings');
    const heroImages = await AdminSettings.get('hero_images');
    const images = heroImages ? JSON.parse(heroImages) : [];
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const getSaleBanners = async (req, res) => {
  try {
    const SaleBanner = require('../models/saleBanner');
    const banners = await SaleBanner.getActive();
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getFeaturedProducts, getHeroImages, getSaleBanners }; 