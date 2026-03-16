const prisma = require('../config/db');

/**
 * Get all transactions across sales, repairs, and second-hand market
 */
const getAllTransactions = async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;

    // Fetch different types of transactions
    const [sales, repairs, shIntakes, shSales, supplierPayments] = await Promise.all([
      prisma.sale.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true, user: true }
      }),
      prisma.repair.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { customer: true, user: true }
      }),
      prisma.secondHandIntake.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: true, customer: true }
      }),
      prisma.secondHandSale.findMany({
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { intake: true }
      }),
      prisma.distributorTransaction.findMany({
        where: { type: 'PAYMENT' },
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { distributor: true, user: true }
      })
    ]);

    // Map and normalize transaction data
    const allTransactions = [
      ...sales.map(s => ({
        id: s.id,
        type: 'SALE',
        amount: s.totalAmount,
        customerName: s.customer?.name || 'Walk-in',
        date: s.createdAt,
        title: `Phone Sale: ${s.invoiceNumber || s.id.slice(0, 8)}`,
        status: s.paymentMode === 'credit' ? 'CREDIT' : 'PAID'
      })),
      ...repairs.map(r => ({
        id: r.id,
        type: 'REPAIR',
        amount: r.totalAmount || r.serviceCharge,
        customerName: r.customer?.name || r.customerName || 'Walk-in',
        date: r.createdAt,
        title: `Repair: ${r.deviceBrand} ${r.deviceModel}`,
        status: r.status
      })),
      ...shIntakes.map(i => ({
        id: i.id,
        type: 'SH_BUY',
        amount: -parseFloat(i.buyingPrice),
        customerName: i.customer?.name || 'Customer',
        date: i.createdAt,
        title: `Second Hand Purchase: ${i.brand} ${i.model}`,
        status: 'COMPLETED'
      })),
      ...shSales.map(ss => ({
        id: ss.intakeId,
        type: 'SH_SELL',
        amount: parseFloat(ss.sellingPrice),
        customerName: ss.buyerName || 'Walk-in',
        date: ss.createdAt,
        title: `Second Hand Sale: ${ss.intake?.brand} ${ss.intake?.model}`,
        status: ss.paymentMode === 'credit' ? 'CREDIT' : 'SOLD'
      })),
      ...supplierPayments.map(p => ({
        id: p.id,
        type: 'SUPPLIER_PAYMENT',
        amount: -parseFloat(p.amount),
        customerName: p.distributor?.name || 'Unknown Supplier',
        date: p.createdAt,
        title: `Supplier Payment: ${p.description || 'Settlement'}`,
        status: 'PAID'
      }))
    ];

    // Sort by date descending with a safer comparison
    allTransactions.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });

    res.json(allTransactions.slice(0, parseInt(limit)));
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTransactions };
