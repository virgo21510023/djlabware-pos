const { DeliveryOrder, DeliveryOrderItem, Invoice, InvoiceItem, Product, sequelize } = require('../models');

/**
 * Membuat Surat Jalan baru dari sebuah Invoice
 */
exports.createDeliveryOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      invoice_id, 
      delivery_date, 
      recipient_name, 
      shipping_address, 
      vehicle_number, 
      driver_name, 
      notes,
      items_to_ship // Array berisi { invoice_item_id, product_id, product_name, quantity_shipped }
    } = req.body;

    if (!invoice_id || !items_to_ship || items_to_ship.length === 0) {
      return res.status(400).json({ message: "Data tidak lengkap." });
    }

    // 1. Buat record DeliveryOrder utama
    const deliveryOrder = await DeliveryOrder.create({
      do_number: `SJ-${Date.now()}`,
      invoice_id,
      delivery_date: delivery_date || new Date(),
      recipient_name,
      shipping_address,
      vehicle_number,
      driver_name,
      notes,
      status: 'Disiapkan'
    }, { transaction: t });

    // 2. Buat record untuk setiap item yang dikirim
    for (const item of items_to_ship) {
      if (item.quantity_shipped > 0) {
        await DeliveryOrderItem.create({
          delivery_order_id: deliveryOrder.id,
          invoice_item_id: item.invoice_item_id,
          product_id: item.product_id,
          product_name: item.product_name,
          quantity_shipped: item.quantity_shipped
        }, { transaction: t });
      }
    }

    // Catatan: Stok tidak diubah di sini karena sudah dipotong saat Invoice dibuat.
    // Di sini murni pencatatan pengiriman.

    await t.commit();
    res.status(201).json(deliveryOrder);

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: 'Gagal membuat Surat Jalan', error: error.message });
  }
};


/**
 * Mengambil semua Surat Jalan berdasarkan ID Invoice
 */
exports.getDeliveryOrdersByInvoice = async (req, res) => {
  try {
    const deliveryOrders = await DeliveryOrder.findAll({
      where: { invoice_id: req.params.invoiceId },
      order: [['delivery_date', 'DESC']]
    });
    res.json(deliveryOrders);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data Surat Jalan.' });
  }
};


/**
 * Mengambil detail satu Surat Jalan
 */
exports.getDeliveryOrderById = async (req, res) => {
  try {
    const deliveryOrder = await DeliveryOrder.findByPk(req.params.id, {
      include: [
        // Ambil info invoice terkait
        { model: Invoice, attributes: ['invoice_number', 'customer_name'] },
        // Ambil item DO dan sertakan detail produk dari setiap item
        {
          model: DeliveryOrderItem,
          as: 'items',
          include: [{
            model: Product,
            attributes: ['satuan', 'merk'] // Ambil satuan & merk
          }]
        }
      ]
    });
    if (deliveryOrder) {
      res.json(deliveryOrder);
    } else {
      res.status(404).json({ message: 'Surat Jalan tidak ditemukan.' });
    }
  } catch (error) {
    console.error("Error di getDeliveryOrderById:", error);
    res.status(500).json({ message: 'Gagal mengambil detail Surat Jalan.' });
  }
};