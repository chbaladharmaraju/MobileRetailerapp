const prisma = require('../config/db');
const { checkInventoryAlerts } = require('../services/inventory.service');

// Create a new sale
const createSale = async (req, res, next) => {
  try {
    const { customerId, customerName, customerPhone, items, discount = 0, paymentMode = 'cash', notes } = req.body;

    let finalCustomerId = customerId;
    if (!finalCustomerId && customerName) {
      const phone = customerPhone || `no-phone-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      let customer;
      if (customerPhone) {
        customer = await prisma.customer.findUnique({ where: { phone: customerPhone } });
      }
      if (!customer) {
        customer = await prisma.customer.create({
          data: { name: customerName, phone }
        });
      }
      finalCustomerId = customer.id;
    }

    if (!finalCustomerId) {
      return res.status(400).json({ message: 'Customer ID or Customer Name is required.' });
    }

    // Calculate totals
    let totalAmount = 0;
    let totalProfit = 0;

    // Verify stock and calculate
    const saleItems = [];
    const itemsWithIds = [];

    for (const item of items) {
      let activeItemId = item.productId;
      let product;

      // Handle on-the-fly item creation for sales
      if (item.isNew && item.name) {
        const sellingPrice = parseFloat(item.price || 0);
        // Create product if it doesn't exist by name
        product = await prisma.product.create({
            data: {
                name: item.name,
                brand: 'Generic',
                model: item.name,
                sellingPrice,
                costPrice: sellingPrice * 0.8, // Estimate cost price
                stock: 0, // Will become negative or as per decrement
            }
        });
        activeItemId = product.id;
      } else {
        product = await prisma.product.findUnique({ where: { id: activeItemId } });
      }

      if (!product) {
        return res.status(404).json({ message: `Product ${activeItemId || item.name} not found.` });
      }

      // Skip stock check for new items or items where we allow overselling (optional)
      // For now, if it's NOT a new item, check stock
      if (!item.isNew && product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const unitPrice = item.isNew ? parseFloat(item.price) : parseFloat(product.sellingPrice);
      const costPrice = parseFloat(product.costPrice);
      const profit = (unitPrice - costPrice) * item.quantity;

      totalAmount += unitPrice * item.quantity;
      totalProfit += profit;

      saleItems.push({
        productId: activeItemId,
        quantity: item.quantity,
        unitPrice,
        costPrice,
        profit,
      });

      itemsWithIds.push({ ...item, productId: activeItemId });
    }

    totalAmount -= parseFloat(discount);

    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          customerId: finalCustomerId,
          userId: req.user.id,
          totalAmount,
          totalProfit,
          discount: parseFloat(discount),
          paymentMode,
          notes,
          items: { create: saleItems },
        },
        include: { items: { include: { product: true } }, customer: true },
      });

      // Decrement stock
      for (const item of itemsWithIds) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // If purchased on credit, increment customer's credit balance
      if (paymentMode === 'credit') {
        await tx.customer.update({
          where: { id: finalCustomerId },
          data: { creditBalance: { increment: totalAmount } }
        });

        await tx.creditTransaction.create({
          data: {
            customerId: finalCustomerId,
            amount: totalAmount,
            type: 'CREDIT',
            description: `New Sale: ${items.length} items`,
            referenceId: newSale.id,
            userId: req.user.id,
          }
        });
      }

      return newSale;
    });

    // Check inventory alerts after sale
    for (const item of items) {
      await checkInventoryAlerts(item.productId, 'product');
    }

    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

// Get all sales
const getSales = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, startDate, endDate } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true, items: { include: { product: true } }, invoice: true },
      }),
      prisma.sale.count({ where }),
    ]);

    res.json({ sales, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// Get sale by ID
const getSale = async (req, res, next) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { customer: true, user: { select: { name: true } }, items: { include: { product: true } }, invoice: true },
    });

    if (!sale) {
      return res.status(404).json({ message: 'Sale not found.' });
    }

    res.json(sale);
  } catch (error) {
    next(error);
  }
};

module.exports = { createSale, getSales, getSale };
