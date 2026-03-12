const prisma = require('../config/db');

const checkInventoryAlerts = async (itemId, type) => {
  try {
    let item, stock, minStock, name;

    if (type === 'product') {
      item = await prisma.product.findUnique({ where: { id: itemId } });
      if (!item) return;
      stock = item.stock;
      minStock = item.minStock;
      name = item.name;
    } else if (type === 'sparePart') {
      item = await prisma.sparePart.findUnique({ where: { id: itemId } });
      if (!item) return;
      stock = item.stock;
      minStock = item.minStock;
      name = item.name;
    }

    if (stock <= 0) {
      await prisma.inventoryAlert.create({
        data: {
          [type === 'product' ? 'productId' : 'sparePartId']: itemId,
          alertType: 'OUT_OF_STOCK',
          message: `${name} is out of stock!`,
        },
      });
    } else if (stock <= minStock) {
      await prisma.inventoryAlert.create({
        data: {
          [type === 'product' ? 'productId' : 'sparePartId']: itemId,
          alertType: 'LOW_STOCK',
          message: `${name} stock is low (${stock} remaining, threshold: ${minStock}).`,
        },
      });
    }
  } catch (error) {
    console.error('Error checking inventory alerts:', error);
  }
};

module.exports = { checkInventoryAlerts };
