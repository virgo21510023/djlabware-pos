const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const transactionController = require('../controllers/transactionController');
const reportController = require('../controllers/reportController');
const stockEntryController = require('../controllers/stockEntryController');
const userController = require('../controllers/userController');
const settingsController = require('../controllers/settingsController');

// Auth Routes
router.post('/auth/login', authController.login);
router.get('/auth/profile', protect, authController.getProfile);

// Product Routes
router.get('/products', protect, productController.getAllProducts);
router.post('/products', protect, admin, productController.createProduct);
router.get('/products', protect, productController.getAllProducts);
router.post('/products', protect, admin, productController.createProduct);

// Transaction Routes
router.post('/products', protect, admin, productController.createProduct);
router.post('/transactions', protect, transactionController.createTransaction);
router.put('/products/:id', protect, admin, productController.updateProduct);
router.delete('/products/:id', protect, admin, productController.deleteProduct);
router.get('/transactions', protect, admin, transactionController.getAllTransactions);
router.get('/transactions/:id', protect, admin, transactionController.getTransactionById);
router.put('/transactions/:id/settle', protect, admin, transactionController.settleTransaction);

// Report Routes
router.get('/reports/sales', protect, admin, reportController.getSalesReport);

// Stock Entry Routes
router.post('/stock-entries', protect, admin, stockEntryController.createStockEntry);
router.get('/reports/dashboard-summary', protect, reportController.getDashboardSummary);

// User Routes (Admin only)
router.get('/users', protect, admin, userController.getAllUsers);
router.post('/users', protect, admin, userController.createUser);
router.delete('/users/:id', protect, admin, userController.deleteUser);

// Setting Routes
router.get('/settings', protect, settingsController.getSettings);
router.put('/settings', protect, admin, settingsController.updateSettings);

module.exports = router;