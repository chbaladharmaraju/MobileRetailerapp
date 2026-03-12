const prisma = require('../config/db');

// Record a credit payment from a customer
const recordPayment = async (req, res, next) => {
  try {
    const { customerId, amount, paymentMode, notes } = req.body;

    if (!customerId || !amount) {
      return res.status(400).json({ message: 'Customer ID and amount are required.' });
    }

    const paymentAmount = parseFloat(amount);

    const transaction = await prisma.$transaction(async (tx) => {
      // Create the payment transaction record
      const creditTx = await tx.creditTransaction.create({
        data: {
          customerId,
          amount: paymentAmount,
          type: 'PAYMENT',
          description: notes || `Payment received via ${paymentMode || 'cash'}`,
          userId: req.user.id,
        },
        include: { customer: true },
      });

      // Update the customer's outstanding credit balance
      await tx.customer.update({
        where: { id: customerId },
        data: {
          creditBalance: { decrement: paymentAmount },
        },
      });

      return creditTx;
    });

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

// Get a customer's credit ledger (transactions)
const getCustomerLedger = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const transactions = await prisma.creditTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
      },
    });

    res.json({ customer, transactions });
  } catch (error) {
    next(error);
  }
};

// Get all customers with outstanding balances
const getCreditCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({
      where: {
        creditBalance: { gt: 0 },
      },
      orderBy: { creditBalance: 'desc' },
    });

    res.json({ customers });
  } catch (error) {
    next(error);
  }
};

module.exports = { recordPayment, getCustomerLedger, getCreditCustomers };
