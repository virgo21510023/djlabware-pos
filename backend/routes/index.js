const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const transactionController = require('../controllers/transactionController');

// Auth Routes
router.post('/auth/login', authController.login);
router.get('/auth/profile', protect, authController.getProfile);

// Product Routes
router.get('/products', protect, productController.getAllProducts);
router.post('/products', protect, admin, productController.createProduct);
// ... rute PUT dan DELETE

// Transaction Routes
router.post('/products', protect, admin, productController.createProduct);
router.post('/transactions', protect, transactionController.createTransaction);
// ... rute GET

module.exports = router;