const multer = require('multer');
const path = require('path');

// Configure storage for different types of uploads
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `uploads/${folder}/`);
    },
    filename: (req, file, cb) => {
      // Generate unique filename with timestamp
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
};

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instances for different upload types
const productUpload = multer({
  storage: createStorage('products'),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const bannerUpload = multer({
  storage: createStorage('banners'),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const heroUpload = multer({
  storage: createStorage('hero'),
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = {
  productUpload: productUpload.single('image'),
  bannerUpload: bannerUpload.single('image'),
  heroUpload: heroUpload.single('image')
}; 