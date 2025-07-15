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
const purchaseController = require('../controllers/purchaseController');
const utilityController = require('../controllers/utilityController');
const quotationController = require('../controllers/quotationController');
const invoiceController = require('../controllers/invoiceController');
const deliveryOrderController = require('../controllers/deliveryOrderController');
const upload = require('../middleware/uploadMiddleware');
const returnController = require('../controllers/returnController');
const purchaseOrderController = require('../controllers/purchaseOrderController');

// Auth Routes
router.post('/auth/login', authController.login);
router.get('/auth/profile', protect, authController.getProfile);

// Product Routes
router.get('/products', protect, productController.getAllProducts);
router.post('/products', protect, admin, productController.createProduct);
router.get('/products', protect, productController.getAllProducts);
router.post('/products', protect, admin, productController.createProduct);
router.get('/products/:id/purchase-history', protect, admin, productController.getProductPurchaseHistory);

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
router.post('/settings/upload-logo', protect, admin, upload.single('logo'), settingsController.uploadLogo);

// Purchase Routes
router.post('/purchases', protect, admin, purchaseController.createPurchase);
router.get('/purchases', protect, admin, purchaseController.getAllPurchases);
router.get('/purchases/:id', protect, admin, purchaseController.getPurchaseById);

// Utility Routes
router.get('/utils/categories', protect, admin, utilityController.getAllCategories);
router.get('/utils/brands', protect, admin, utilityController.getAllBrands);

// Quotation Routes
router.post('/quotations', protect, admin, quotationController.createQuotation);
router.get('/quotations', protect, admin, quotationController.getAllQuotations);
router.get('/quotations/:id', protect, admin, quotationController.getQuotationById);

// Invoice Routes
router.get('/invoices', protect, admin, invoiceController.getAllInvoices);
router.post('/invoices/from-quotation', protect, admin, invoiceController.createInvoiceFromQuotation);
router.post('/invoices/:id/payments', protect, admin, invoiceController.recordPayment);
router.get('/invoices/:id', protect, admin, invoiceController.getInvoiceById);

// Terbilang Routes
router.get('/utils/terbilang', protect, admin, utilityController.getTerbilang);

// Delivery Order Routes
router.post('/delivery-orders', protect, admin, deliveryOrderController.createDeliveryOrder);
router.get('/invoices/:invoiceId/delivery-orders', protect, admin, deliveryOrderController.getDeliveryOrdersByInvoice);
router.get('/delivery-orders/:id', protect, admin, deliveryOrderController.getDeliveryOrderById);

// Sales Return Routes
router.post('/returns/sales', protect, admin, returnController.createSalesReturn);

// Purchase Order Routes
router.post('/purchase-orders', protect, admin, purchaseOrderController.createPurchaseOrder);
router.get('/purchase-orders', protect, admin, purchaseOrderController.getAllPurchaseOrders);
router.get('/purchase-orders/:id', protect, admin, purchaseOrderController.getPurchaseOrderById);

module.exports = router;