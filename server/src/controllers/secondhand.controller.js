const prisma = require('../config/db');

// Intake a second-hand phone
const createIntake = async (req, res, next) => {
  try {
    const { customerId, customerName, customerPhone, brand, model, imei, buyingPrice, condition, notes } = req.body;

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

    const intake = await prisma.secondHandIntake.create({
      data: {
        customerId: finalCustomerId,
        userId: req.user.id,
        brand,
        model,
        imei,
        buyingPrice: parseFloat(buyingPrice),
        condition,
        kycPhotos: req.body.kycPhotos || [],
        devicePhotos: req.body.devicePhotos || [],
        notes,
      },
      include: { customer: true },
    });

    res.status(201).json(intake);
  } catch (error) {
    next(error);
  }
};

// Get all second-hand intakes
const getIntakes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isSold } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (isSold !== undefined) {
      where.isSold = isSold === 'true';
    }

    const [intakes, total] = await Promise.all([
      prisma.secondHandIntake.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true, sale: true },
      }),
      prisma.secondHandIntake.count({ where }),
    ]);

    res.json({ intakes, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// Get intake by ID
const getIntake = async (req, res, next) => {
  try {
    const intake = await prisma.secondHandIntake.findUnique({
      where: { id: req.params.id },
      include: { customer: true, user: { select: { name: true } }, sale: true },
    });

    if (!intake) {
      return res.status(404).json({ message: 'Intake not found.' });
    }

    res.json(intake);
  } catch (error) {
    next(error);
  }
};

// Sell a second-hand phone
const createResale = async (req, res, next) => {
  try {
    const { intakeId, buyerName, buyerPhone, sellingPrice, paymentMode = 'cash' } = req.body;

    const intake = await prisma.secondHandIntake.findUnique({ where: { id: intakeId } });
    if (!intake) {
      return res.status(404).json({ message: 'Intake not found.' });
    }
    if (intake.isSold) {
      return res.status(400).json({ message: 'This phone has already been sold.' });
    }

    const profit = parseFloat(sellingPrice) - parseFloat(intake.buyingPrice);

    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.secondHandSale.create({
        data: {
          intakeId,
          buyerName,
          buyerPhone,
          sellingPrice: parseFloat(sellingPrice),
          profit,
          paymentMode,
        },
        include: { intake: true },
      });

      await tx.secondHandIntake.update({
        where: { id: intakeId },
        data: { isSold: true },
      });

      return newSale;
    });

    res.status(201).json(sale);
  } catch (error) {
    next(error);
  }
};

module.exports = { createIntake, getIntakes, getIntake, createResale };
