const { Invoice, InvoiceItem, Quotation, QuotationItem, Product, Payment, sequelize } = require('../models');

// Mengambil semua invoice
exports.getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.findAll({ order: [['invoice_date', 'DESC']] });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil daftar invoice.' });
  }
};

// Mengambil detail satu invoice
exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findByPk(req.params.id, {
      include: [
        { model: InvoiceItem, as: 'items', include: [Product] },
        { model: Payment, as: 'payments' } // Ambil riwayat pembayaran
      ]
    });
    if (invoice) {
      res.json(invoice);
    } else { res.status(404).json({ message: 'Invoice tidak ditemukan' }); }
  } catch (error) { res.status(500).json({ message: 'Gagal mengambil detail invoice' }); }
};

// Membuat Invoice dari Penawaran yang disetujui
exports.createInvoiceFromQuotation = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { quotationId } = req.body;
    const quotation = await Quotation.findByPk(quotationId, {
      include: [{ model: QuotationItem, as: 'items' }]
    });

    if (!quotation) {
      return res.status(404).json({ message: 'Penawaran tidak ditemukan.' });
    }
    
    // 1. Buat Invoice baru berdasarkan data Penawaran
    const newInvoice = await Invoice.create({
      invoice_number: `INV-${Date.now()}`,
      quotation_id: quotation.id,
      invoice_date: new Date(),
      due_date: new Date(new Date().setDate(new Date().getDate() + 30)),
      customer_name: quotation.customer_name,
      subtotal: quotation.subtotal,
      // PERBAIKAN DI SINI: Salin persentase diskon dari penawaran
      discount_percentage: quotation.discount_percentage,
      shipping_cost: quotation.shipping_cost,
      vat_amount: quotation.vat_amount,
      grand_total: quotation.grand_total,
      amount_paid: 0,
      amount_due: quotation.grand_total,
      payment_method: 'Tempo',
      status: 'Belum Dibayar',
    }, { transaction: t });

    // 2. Salin item (tidak ada perubahan di sini)
    for (const item of quotation.items) {
      await InvoiceItem.create({
        invoice_id: newInvoice.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        stock_status: item.stock_status
      }, { transaction: t });

      if (item.product_id) {
        const product = await Product.findByPk(item.product_id, { transaction: t });
        if (product) {
          await product.decrement('stock', { by: item.quantity, transaction: t });
        }
      }
    }

    // 3. Update status penawaran (tidak ada perubahan di sini)
    await quotation.update({ status: 'Selesai (Invoiced)' }, { transaction: t });

    await t.commit();
    res.status(201).json(newInvoice);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal membuat invoice', error: error.message });
  }
};

// FUNGSI BARU: Mencatat pembayaran untuk sebuah invoice
exports.recordPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { amount, payment_date, method } = req.body;
    const invoice = await Invoice.findByPk(req.params.id, { transaction: t });

    if (!invoice) return res.status(404).json({ message: 'Invoice tidak ditemukan' });

    const paidAmount = parseFloat(amount);
    
    // 1. Buat catatan pembayaran baru
    await Payment.create({
      invoice_id: invoice.id,
      amount: paidAmount,
      payment_date: payment_date || new Date(),
      method: method || 'Transfer'
    }, { transaction: t });

    // 2. Update total yang sudah dibayar dan sisa tagihan di invoice
    invoice.amount_paid = (parseFloat(invoice.amount_paid) || 0) + paidAmount;
    invoice.amount_due = (parseFloat(invoice.amount_due) || 0) - paidAmount;
    
    if (invoice.amount_due <= 0) {
      invoice.amount_due = 0;
      invoice.status = 'Lunas';
    } else {
      invoice.status = 'Dibayar Sebagian';
    }
    
    await invoice.save({ transaction: t });
    await t.commit();
    res.json(invoice);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal mencatat pembayaran', error: error.message });
  }
};