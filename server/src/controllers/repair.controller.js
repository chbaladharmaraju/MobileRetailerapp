const prisma = require('../config/db');
const { checkInventoryAlerts } = require('../services/inventory.service');

// Create a repair job
const createRepair = async (req, res, next) => {
  try {
    const { customerId, customerName, customerPhone, deviceBrand, deviceModel, imei, issueDescription, estimatedCost, notes } = req.body;

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

    const repair = await prisma.repair.create({
      data: {
        customerId: finalCustomerId,
        userId: req.user.id,
        deviceBrand,
        deviceModel,
        imei,
        issueDescription,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        beforePhotos: req.body.beforePhotos || [],
        notes,
      },
      include: { customer: true },
    });

    res.status(201).json(repair);
  } catch (error) {
    next(error);
  }
};

// Get all repairs
const getRepairs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;

    const [repairs, total] = await Promise.all([
      prisma.repair.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true, parts: { include: { sparePart: true } }, invoice: true },
      }),
      prisma.repair.count({ where }),
    ]);

    res.json({ repairs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// Get repair by ID
const getRepair = async (req, res, next) => {
  try {
    const repair = await prisma.repair.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        user: { select: { name: true } },
        parts: { include: { sparePart: true } },
        invoice: true,
      },
    });

    if (!repair) {
      return res.status(404).json({ message: 'Repair not found.' });
    }

    res.json(repair);
  } catch (error) {
    next(error);
  }
};

// Update repair status
const updateRepair = async (req, res, next) => {
  try {
    const { status, finalCost, serviceCharge, afterPhotos, notes } = req.body;

    const data = {};
    if (status) data.status = status;
    if (finalCost !== undefined) data.finalCost = parseFloat(finalCost);
    if (serviceCharge !== undefined) data.serviceCharge = parseFloat(serviceCharge);
    if (afterPhotos) data.afterPhotos = afterPhotos;
    if (notes) data.notes = notes;

    if (status === 'COMPLETED') {
      data.completedAt = new Date();

      // Calculate total profit
      const repair = await prisma.repair.findUnique({
        where: { id: req.params.id },
        include: { parts: true },
      });

      const totalPartsCost = repair.parts.reduce((sum, p) => sum + parseFloat(p.unitCost) * p.quantity, 0);
      const charge = parseFloat(serviceCharge || repair.serviceCharge || 0);
      data.totalProfit = charge - totalPartsCost;
    }

    if (status === 'DELIVERED') {
      data.deliveredAt = new Date();
    }

    const repair = await prisma.repair.update({
      where: { id: req.params.id },
      data,
      include: { customer: true, parts: { include: { sparePart: true } } },
    });

    res.json(repair);
  } catch (error) {
    next(error);
  }
};

// Add parts to a repair
const addRepairPart = async (req, res, next) => {
  try {
    const { sparePartId, quantity = 1 } = req.body;

    const sparePart = await prisma.sparePart.findUnique({ where: { id: sparePartId } });
    if (!sparePart) {
      return res.status(404).json({ message: 'Spare part not found.' });
    }
    if (sparePart.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock for ${sparePart.name}. Available: ${sparePart.stock}` });
    }

    const [repairPart] = await prisma.$transaction([
      prisma.repairPart.create({
        data: {
          repairId: req.params.id,
          sparePartId,
          quantity,
          unitCost: sparePart.costPrice,
        },
        include: { sparePart: true },
      }),
      prisma.sparePart.update({
        where: { id: sparePartId },
        data: { stock: { decrement: quantity } },
      }),
    ]);

    // Check inventory alerts
    await checkInventoryAlerts(sparePartId, 'sparePart');

    res.status(201).json(repairPart);
  } catch (error) {
    next(error);
  }
};

module.exports = { createRepair, getRepairs, getRepair, updateRepair, addRepairPart };
