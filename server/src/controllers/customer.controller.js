const prisma = require('../config/db');

// Create a customer
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, address, idProof } = req.body;
    const customer = await prisma.customer.create({
      data: { name, phone, email, address, idProof },
    });
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

// Get all customers
const getCustomers = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { sales: true, repairs: true, secondHandIntakes: true }
          }
        }
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({ customers, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// Get customer by ID
const getCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        sales: { orderBy: { createdAt: 'desc' } },
        secondHandIntakes: { orderBy: { createdAt: 'desc' } },
        repairs: { orderBy: { createdAt: 'desc' } },
        _count: {
          select: { sales: true, repairs: true, secondHandIntakes: true }
        }
      },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// Update customer
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

module.exports = { createCustomer, getCustomers, getCustomer, updateCustomer };
