const prisma = require('../config/db');

const getAnalytics = async (req, res, next) => {
  try {
    const { period = 'monthly' } = req.query; // daily, monthly, yearly

    const now = new Date();
    let startDate;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const dateFilter = { createdAt: { gte: startDate } };
    
    // User filter logic: Staff only see their own data, Admins see everything unless they filter for a specific user
    let userFilter = {};
    if (req.user.role === 'STAFF') {
      userFilter = { userId: req.user.id };
    } else if (req.query.userId) {
      userFilter = { userId: req.query.userId };
    }

    const filterWithUser = { ...dateFilter, ...userFilter };

    // Run aggregates in parallel for performance
    const [
      saleItemsAgg,
      salesAgg,
      secondHandSalesAgg,
      secondHandCostAgg,
      repairsAgg,
      productsAgg,
      soldItemsAgg,
      secondHandInStockCount,
      lowStockProductsRaw,
      lowStockPartsRaw,
      unreadAlertsCount,
      creditAgg,
      distributorDuesAgg,
      allRepairsCount,
    ] = await Promise.all([
      // New phone sale items (profit, cost, quantity)
      prisma.saleItem.aggregate({
        where: { sale: filterWithUser },
        _sum: { profit: true, costPrice: true, quantity: true },
      }),
      // New phone sales (revenue, count)
      prisma.sale.aggregate({
        where: filterWithUser,
        _sum: { totalAmount: true },
        _count: true,
      }),
      // Second-hand sales (revenue, profit, count)
      prisma.secondHandSale.aggregate({
        where: { intake: userFilter, createdAt: { gte: startDate } },
        _sum: { sellingPrice: true, profit: true },
        _count: true,
      }),
      // Second-hand purchase cost (COGS approximation)
      prisma.secondHandIntake.aggregate({
        where: { ...userFilter, isSold: true, sale: { createdAt: { gte: startDate } } },
        _sum: { buyingPrice: true },
      }),
      // Repairs (completed in period)
      prisma.repair.aggregate({
        where: { ...filterWithUser, status: 'COMPLETED' },
        _sum: { serviceCharge: true, totalProfit: true },
        _count: true,
      }),
      // Total products in stock
      prisma.product.aggregate({
        _sum: { stock: true },
      }),
      // Total sold items
      prisma.saleItem.aggregate({
        where: { sale: filterWithUser },
        _sum: { quantity: true },
      }),
      // Second-hand phones still in stock
      prisma.secondHandIntake.count({ where: { isSold: false } }),
      // Low stock products
      prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "products" WHERE "stock" <= "minStock"`,
      // Low stock spare parts
      prisma.$queryRaw`SELECT COUNT(*)::int AS count FROM "spare_parts" WHERE "stock" <= "minStock"`,
      // Unread inventory alerts
      prisma.inventoryAlert.count({ where: { isRead: false } }),
      // Total outstanding customer credit
      prisma.customer.aggregate({
        _sum: { creditBalance: true },
      }),
      // Total supplier dues
      prisma.distributor.aggregate({
        _sum: { balanceOwed: true },
      }),
      // All repairs count in period (any status)
      prisma.repair.count({ where: filterWithUser }),
    ]);

    const newSalesRevenue = parseFloat(salesAgg._sum.totalAmount || 0);
    const newSalesProfit = parseFloat(saleItemsAgg._sum.profit || 0);
    const newSalesCost = parseFloat(saleItemsAgg._sum.costPrice || 0);

    const secondHandRevenue = parseFloat(secondHandSalesAgg._sum.sellingPrice || 0);
    const secondHandProfit = parseFloat(secondHandSalesAgg._sum.profit || 0);
    const secondHandCost = parseFloat(secondHandCostAgg._sum.buyingPrice || 0);

    const repairsRevenue = parseFloat(repairsAgg._sum.serviceCharge || 0);
    const repairsProfit = parseFloat(repairsAgg._sum.totalProfit || 0);

    const totalRevenue = newSalesRevenue + secondHandRevenue + repairsRevenue;
    const totalProfit = newSalesProfit + secondHandProfit + repairsProfit;
    const totalPurchaseCost = newSalesCost + secondHandCost;

    const outstandingCredit = parseFloat(creditAgg._sum.creditBalance || 0);

    // Sales trend data (last N periods based on filter)
    const salesTrend = await getSalesTrend(period, userFilter);

    res.json({
      summary: {
        newSales: {
          count: salesAgg._count,
          revenue: newSalesRevenue,
          profit: newSalesProfit,
          cost: newSalesCost,
        },
        secondHandSales: {
          count: secondHandSalesAgg._count,
          revenue: secondHandRevenue,
          profit: secondHandProfit,
          cost: secondHandCost,
        },
        repairs: {
          count: repairsAgg._count,
          revenue: repairsRevenue,
          profit: repairsProfit,
        },
        totalRevenue,
        totalProfit,
        totalPurchaseCost,
        outstandingCredit,
        supplierDues: parseFloat(distributorDuesAgg._sum.balanceOwed || 0),
        totalRepairsInPeriod: allRepairsCount,
      },
      inventory: {
        totalProductsInStock: parseInt(productsAgg._sum.stock || 0, 10),
        totalSoldItems: parseInt(soldItemsAgg._sum.quantity || 0, 10),
        secondHandInStock: secondHandInStockCount,
        lowStockProducts: Number(lowStockProductsRaw[0]?.count || 0),
        lowStockParts: Number(lowStockPartsRaw[0]?.count || 0),
        unresolvedAlerts: unreadAlertsCount,
      },
      salesTrend,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Get sales trend data
async function getSalesTrend(period, userFilter = {}) {
  const now = new Date();
  const trends = [];

  const periodsCount = period === 'daily' ? 30 : period === 'monthly' ? 12 : 5;

  for (let i = periodsCount - 1; i >= 0; i--) {
    let startDate, endDate, label;

    if (period === 'daily') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      label = startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    } else if (period === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      label = startDate.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    } else {
      startDate = new Date(now.getFullYear() - i, 0, 1);
      endDate = new Date(now.getFullYear() - i + 1, 0, 1);
      label = startDate.getFullYear().toString();
    }

    const dateFilter = { createdAt: { gte: startDate, lt: endDate } };
    const filterWithUser = { ...dateFilter, ...userFilter };

    const [newSales, shSales, repairData, purchases, supplierTrans, customerCredit] = await Promise.all([
      prisma.sale.aggregate({ where: filterWithUser, _sum: { totalAmount: true, totalProfit: true }, _count: true }),
      prisma.secondHandSale.aggregate({ where: { intake: userFilter, createdAt: { gte: startDate, lt: endDate } }, _sum: { sellingPrice: true, profit: true }, _count: true }),
      prisma.repair.aggregate({ where: { ...filterWithUser, status: 'COMPLETED' }, _sum: { serviceCharge: true, totalProfit: true }, _count: true }),
      // inventory purchases cost 
      prisma.inventoryPurchase.aggregate({ where: filterWithUser, _sum: { totalCost: true } }),
      // new credit from suppliers
      prisma.distributorTransaction.aggregate({ 
        where: { ...filterWithUser, type: 'CREDIT' }, 
        _sum: { amount: true } 
      }),
      // new credit to customers (pending amount accrued this period)
      prisma.creditTransaction.aggregate({
        where: { ...filterWithUser, type: 'CREDIT' },
        _sum: { amount: true }
      }),
    ]);

    trends.push({
      label,
      newSalesRevenue: parseFloat(newSales._sum.totalAmount || 0),
      secondHandRevenue: parseFloat(shSales._sum.sellingPrice || 0),
      repairRevenue: parseFloat(repairData._sum.serviceCharge || 0),
      purchaseCost: parseFloat(purchases._sum.totalCost || 0),
      supplierCredit: parseFloat(supplierTrans._sum.amount || 0),
      totalRevenue:
        parseFloat(newSales._sum.totalAmount || 0) +
        parseFloat(shSales._sum.sellingPrice || 0) +
        parseFloat(repairData._sum.serviceCharge || 0),
      totalProfit:
        parseFloat(newSales._sum.totalProfit || 0) +
        parseFloat(shSales._sum.profit || 0) +
        parseFloat(repairData._sum.totalProfit || 0),
      customerPending: parseFloat(customerCredit._sum.amount || 0),
    });
  }

  return trends;
}

module.exports = { getAnalytics };
