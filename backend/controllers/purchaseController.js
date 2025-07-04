const { Purchase, PurchaseItem, Product, sequelize } = require('../models');

exports.createPurchase = async (req, res) => {
  console.log("--- [DEBUG] Menerima request createPurchase ---");
  console.log("Payload diterima:", JSON.stringify(req.body, null, 2));
  
  const t = await sequelize.transaction();
  try {
    const { invoice_number, purchase_date, supplier_name, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Harus ada setidaknya satu item." });
    }

    const totalAmount = items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchase_price || 0)), 0);

    console.log("--- [DEBUG] 1. Mencoba membuat Purchase...");
    const purchase = await Purchase.create({
      invoice_number: invoice_number || `NOTA-${Date.now()}`,
      purchase_date: purchase_date || new Date(),
      supplier_name: supplier_name || 'N/A',
      total_amount: totalAmount
    }, { transaction: t });
    console.log("--- [DEBUG] 1. SUKSES membuat Purchase, ID:", purchase.id);

    for (const [index, item] of items.entries()) {
      console.log(`--- [DEBUG] 2. Memproses item #${index + 1}: ${item.name}`);
      let product;

      if (item.is_new) {
        console.log("--- [DEBUG] 2a. Item adalah produk BARU. Mencoba Product.create...");
        product = await Product.create({
          name: item.name,
          sku: item.sku || `SKU-${Date.now()}`,
          stock: 0,
          hpp: item.purchase_price || 0,
          sell_price: item.sell_price || 0,
          kategori: item.kategori || 'Lainnya',
          merk: item.merk || 'N/A',
          satuan: item.satuan || 'Pcs'
        }, { transaction: t });
        console.log(`--- [DEBUG] 2a. SUKSES Product.create, ID Produk Baru:`, product.id);
      } else {
        console.log(`--- [DEBUG] 2a. Item adalah produk LAMA. Mencari produk ID: ${item.product_id}`);
        product = await Product.findByPk(item.product_id, { transaction: t });
        console.log(`--- [DEBUG] 2a. SUKSES menemukan produk lama.`);
      }

      if (!product) throw new Error(`Produk tidak valid untuk item: ${item.name}`);
      
      console.log("--- [DEBUG] 2b. Mencoba PurchaseItem.create...");
      await PurchaseItem.create({
        purchase_id: purchase.id,
        product_id: product.id,
        quantity: item.quantity,
        purchase_price: item.purchase_price
      }, { transaction: t });
      console.log("--- [DEBUG] 2b. SUKSES PurchaseItem.create.");

      console.log(`--- [DEBUG] 2c. Mencoba menambah stok produk...`);
      await product.increment('stock', { by: item.quantity, transaction: t });
      console.log("--- [DEBUG] 2c. SUKSES menambah stok.");
      
      if(item.purchase_price > 0 && item.sell_price > 0) {
         console.log(`--- [DEBUG] 2d. Mencoba update HPP & Harga Jual...`);
         await product.update({
          hpp: item.purchase_price,
          sell_price: item.sell_price
        }, { transaction: t });
         console.log(`--- [DEBUG] 2d. SUKSES update harga.`);
      }
    }
    
    console.log("--- [DEBUG] 3. Mencoba COMMIT transaksi...");
    await t.commit();
    console.log("--- [DEBUG] 3. SUKSES COMMIT.");
    res.status(201).json({ message: 'Pembelian berhasil dicatat.' });

  } catch (error) {
    console.error("!!! ERROR KRITIS di createPurchase. Melakukan ROLLBACK... !!!");
    console.error(error); // Ini akan mencetak detail error yang sebenarnya
    await t.rollback();
    console.log("--- [DEBUG] Rollback selesai.");
    res.status(500).json({ message: 'Gagal mencatat pembelian', error: error.message });
  }
};