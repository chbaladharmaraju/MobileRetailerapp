const prisma = require('../config/db');
const { checkInventoryAlerts } = require('../services/inventory.service');

// ─── PRODUCTS ────────────────────────────────────────────

const createProduct = async (req, res, next) => {
  try {
    const { name, brand, model, imei, costPrice, sellingPrice, stock, minStock, image, specs } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        brand,
        model,
        imei,
        costPrice: parseFloat(costPrice),
        sellingPrice: parseFloat(sellingPrice),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
        image,
        specs,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, lowStock } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (lowStock === 'true') {
      where.stock = { lte: prisma.product.fields?.minStock || 5 };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

const getProduct = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { saleItems: true },
    });

    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json(product);
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.costPrice) data.costPrice = parseFloat(data.costPrice);
    if (data.sellingPrice) data.sellingPrice = parseFloat(data.sellingPrice);
    if (data.stock !== undefined) data.stock = parseInt(data.stock);
    if (data.minStock !== undefined) data.minStock = parseInt(data.minStock);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });

    // Check inventory alerts after stock update
    if (data.stock !== undefined) {
      await checkInventoryAlerts(req.params.id, 'product');
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: 'Product deleted.' });
  } catch (error) {
    next(error);
  }
};

// ─── SPARE PARTS ─────────────────────────────────────────

const createSparePart = async (req, res, next) => {
  try {
    const { name, category, costPrice, stock, minStock, supplier } = req.body;

    const part = await prisma.sparePart.create({
      data: {
        name,
        category,
        costPrice: parseFloat(costPrice),
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 3,
        supplier,
      },
    });

    res.status(201).json(part);
  } catch (error) {
    next(error);
  }
};

const getSpareParts = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (category) {
      where.category = category;
    }

    const [parts, total] = await Promise.all([
      prisma.sparePart.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.sparePart.count({ where }),
    ]);

    res.json({ parts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

const updateSparePart = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.costPrice) data.costPrice = parseFloat(data.costPrice);
    if (data.stock !== undefined) data.stock = parseInt(data.stock);
    if (data.minStock !== undefined) data.minStock = parseInt(data.minStock);

    const part = await prisma.sparePart.update({
      where: { id: req.params.id },
      data,
    });

    if (data.stock !== undefined) {
      await checkInventoryAlerts(req.params.id, 'sparePart');
    }

    res.json(part);
  } catch (error) {
    next(error);
  }
};

// ─── INVENTORY ALERTS ────────────────────────────────────

const getAlerts = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    const where = {};
    if (isRead !== undefined) where.isRead = isRead === 'true';

    const alerts = await prisma.inventoryAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { product: true, sparePart: true },
      take: 50,
    });

    res.json(alerts);
  } catch (error) {
    next(error);
  }
};

const markAlertRead = async (req, res, next) => {
  try {
    const alert = await prisma.inventoryAlert.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json(alert);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct, getProducts, getProduct, updateProduct, deleteProduct,
  createSparePart, getSpareParts, updateSparePart,
  getAlerts, markAlertRead,
};
