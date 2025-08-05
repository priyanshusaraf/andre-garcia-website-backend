const Review = require('../models/review');
const Product = require('../models/product');
const Order = require('../models/order');

const createReview = async (req, res) => {
  const { product_id, order_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    // Validate required fields
    if (!product_id || !order_id || !rating) {
      return res.status(400).json({ message: 'Product ID, Order ID, and rating are required' });
    }

    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Check if user has already reviewed this product for this order
    const existingReview = await Review.exists(user_id, product_id, order_id);
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this product for this order' });
    }

    // Verify that the order belongs to the user and contains the product
    const order = await Order.getById(order_id);
    if (!order || order.user_id !== user_id) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is completed (users can only review completed orders)
    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'You can only review products from completed orders' });
    }

    // Verify the product exists in the order
    const orderItems = await Order.getOrderItems(order_id);
    const productInOrder = orderItems.find(item => item.product_id === Number(product_id));
    if (!productInOrder) {
      return res.status(400).json({ message: 'Product not found in this order' });
    }

    // Create the review
    const review = await Review.create({
      user_id: Number(user_id),
      product_id: Number(product_id),
      order_id: Number(order_id),
      rating: Number(rating),
      comment: comment ? comment.trim() : null
    });

    // Update product rating and review count
    const stats = await Review.getProductStats(product_id);
    await Product.update(product_id, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const reviews = await Review.getByProductId(productId);
    
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: {
          name: review.users.name
        }
      }))
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getUserReviews = async (req, res) => {
  const user_id = req.user.id;

  try {
    const reviews = await Review.getByUserId(user_id);
    
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        product: {
          id: review.products.id,
          name: review.products.name,
          image_url: review.products.image_url
        },
        order: {
          id: review.orders.id,
          created_at: review.orders.created_at
        }
      }))
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    // Get the review
    const review = await Review.getById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review
    if (review.user_id !== user_id) {
      return res.status(403).json({ message: 'You can only edit your own reviews' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Update the review
    const updateData = {};
    if (rating !== undefined) updateData.rating = Number(rating);
    if (comment !== undefined) updateData.comment = comment ? comment.trim() : null;

    const updatedReview = await Review.update(id, updateData);

    // Update product rating and review count
    const stats = await Review.getProductStats(review.product_id);
    await Product.update(review.product_id, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.json({
      success: true,
      message: 'Review updated successfully',
      review: {
        id: updatedReview.id,
        rating: updatedReview.rating,
        comment: updatedReview.comment,
        updated_at: updatedReview.updated_at
      }
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteReview = async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    // Get the review
    const review = await Review.getById(id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.user_id !== user_id && !req.user.is_admin) {
      return res.status(403).json({ message: 'You can only delete your own reviews' });
    }

    const product_id = review.product_id;

    // Delete the review
    await Review.delete(id);

    // Update product rating and review count
    const stats = await Review.getProductStats(product_id);
    await Product.update(product_id, {
      rating: stats.averageRating,
      reviews: stats.totalReviews
    });

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.getAllReviews();
    
    res.json({
      success: true,
      reviews: reviews.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        user: {
          id: review.users.id,
          name: review.users.name,
          email: review.users.email
        },
        product: {
          id: review.products.id,
          name: review.products.name,
          image_url: review.products.image_url
        },
        order: {
          id: review.orders.id,
          created_at: review.orders.created_at
        }
      }))
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  getAllReviews
}; 