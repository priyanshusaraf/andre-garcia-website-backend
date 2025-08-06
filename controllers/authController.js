const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Hardcoded admin credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'Admin@123!'
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await User.getByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash });
    
    // Generate token for auto-login
    const token = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      is_admin: user.is_admin || false 
    }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        is_admin: user.is_admin || false 
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, is_admin: user.is_admin }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, is_admin: user.is_admin } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  try {
    // Check hardcoded admin credentials
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Create admin token with special admin properties
      const token = jwt.sign({ 
        id: 999999, // Use a numeric ID for admin
        username: 'admin', 
        is_admin: true,
        is_super_admin: true 
      }, process.env.JWT_SECRET, { expiresIn: '7d' });
      
      res.json({ 
        token, 
        user: { 
          id: 999999, // Use a numeric ID for admin
          name: 'Administrator', 
          username: 'admin',
          is_admin: true,
          is_super_admin: true
        } 
      });
    } else {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, phone, currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  try {
    // Get current user
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await User.getByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    // Prepare update data
    const updateData = {
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : null
    };

    // Handle password change if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to change password' });
      }

      // Verify current password
      const match = await bcrypt.compare(currentPassword, user.password_hash);
      if (!match) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      updateData.password_hash = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        is_admin: updatedUser.is_admin
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  // Validation
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  // Password strength validation
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({ 
      message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'New password must be different from current password' });
  }

  try {
    // Get current user
    const user = await User.getById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await User.update(userId, { password_hash });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: 'Email and new password are required' });
  }

  // Password validation
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters long' });
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
    return res.status(400).json({ 
      message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number' 
    });
  }

  try {
    // Check if user exists
    const user = await User.getByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address' });
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update user password
    await User.update(user.id, { password_hash });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { register, login, adminLogin, updateProfile, changePassword, resetPassword }; 