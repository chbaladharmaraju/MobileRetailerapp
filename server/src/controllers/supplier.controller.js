const prisma = require('../config/db');

// ==========================================
// DISTRIBUTOR MANAGEMENT
// ==========================================

const getDistributors = async (req, res) => {
  try {
    const { type } = req.query;
    const where = {};
    if (type && type !== 'ALL') {
      where.type = type;
    }

    const distributors = await prisma.distributor.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { purchases: true }
        }
      }
    });
    res.json(distributors);
  } catch (error) {
    console.error('Error fetching distributors:', error);
    res.status(500).json({ error: 'Failed to fetch distributors' });
  }
};

const getDistributorById = async (req, res) => {
  try {
    const { id } = req.params;
    const distributor = await prisma.distributor.findUnique({
      where: { id },
      include: {
        purchases: {
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!distributor) {
      return res.status(404).json({ error: 'Distributor not found' });
    }

    res.json(distributor);
  } catch (error) {
    console.error('Error fetching distributor details:', error);
    res.status(500).json({ error: 'Failed to fetch distributor details' });
  }
};

const createDistributor = async (req, res) => {
  try {
    const { name, phone, email, address, type } = req.body;

    const existingDistributor = await prisma.distributor.findUnique({ where: { phone } });
    if (existingDistributor) {
      return res.status(400).json({ error: 'Distributor with this phone number already exists' });
    }

    const distributor = await prisma.distributor.create({
      data: { name, phone, email, address, type: type || 'BOTH' }
    });
    
    res.status(201).json(distributor);
  } catch (error) {
    console.error('Error creating distributor:', error);
    res.status(500).json({ error: 'Failed to create distributor' });
  }
};

// ==========================================
// INVENTORY INTAKE (PURCHASES)
// ==========================================

const recordInventoryPurchase = async (req, res) => {
  try {
    const { distributorId, newDistributor, items, totalCost, paymentStatus, notes } = req.body;
    const userId = req.user.id; // From auth middleware

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided for intake' });
    }

    const result = await prisma.$transaction(async (tx) => {
      let activeDistributorId = distributorId;

      // Handle on-the-fly distributor creation
      if (!activeDistributorId && newDistributor && newDistributor.name && newDistributor.phone) {
        const existing = await tx.distributor.findUnique({ where: { phone: newDistributor.phone } });
        if (existing) {
          activeDistributorId = existing.id;
        } else {
          const created = await tx.distributor.create({
            data: {
              name: newDistributor.name,
              phone: newDistributor.phone,
              email: newDistributor.email,
              address: newDistributor.address
            }
          });
          activeDistributorId = created.id;
        }
      }

      if (!activeDistributorId) {
        throw new Error('Distributor is required. Select an existing one or create a new one.');
      }

      // 2. Process Items and Increment Stock
      const processedItems = [];
      for (const item of items) {
        let activeItemId = item.id;
        let itemName = item.name;

        // If it's a new item (no ID), create it on the fly
        if (!activeItemId && item.name) {
          if (item.itemType === 'PRODUCT') {
            const created = await tx.product.create({
              data: {
                name: item.name,
                brand: 'Generic', // Defaulting for on-the-fly creation
                model: item.name,
                costPrice: parseFloat(item.unitCost),
                sellingPrice: parseFloat(item.unitCost) * 1.2, // Default markup
                stock: 0, // Will be incremented below
                distributorId: activeDistributorId
              }
            });
            activeItemId = created.id;
          } else if (item.itemType === 'SPARE_PART') {
            const created = await tx.sparePart.create({
              data: {
                name: item.name,
                costPrice: parseFloat(item.unitCost),
                sellingPrice: parseFloat(item.unitCost) * 1.5, // Default markup
                stock: 0, // Will be incremented below
                distributorId: activeDistributorId
              }
            });
            activeItemId = created.id;
          }
        }

        if (!activeItemId) {
            throw new Error(`Item ${item.name || 'Unknown'} could not be identified or created.`);
        }

        // Add to processed list for purchaseItems creation
        processedItems.push({
            ...item,
            id: activeItemId
        });

        // 3. Increment Stock
        if (item.itemType === 'PRODUCT') {
          await tx.product.update({
            where: { id: activeItemId },
            data: { 
              stock: { increment: parseInt(item.quantity) },
              costPrice: parseFloat(item.unitCost),
              distributorId: activeDistributorId
            }
          });
        } else if (item.itemType === 'SPARE_PART') {
          await tx.sparePart.update({
            where: { id: activeItemId },
            data: { 
              stock: { increment: parseInt(item.quantity) },
              costPrice: parseFloat(item.unitCost),
              distributorId: activeDistributorId
            }
          });
        }
      }

      // 4. Create the Purchase Record (Update items with resolved IDs)
      const purchase = await tx.inventoryPurchase.create({
        data: {
          distributorId: activeDistributorId,
          userId,
          totalCost: parseFloat(totalCost),
          paymentStatus,
          notes,
          items: {
            create: processedItems.map(item => ({
              itemType: item.itemType,
              productId: item.itemType === 'PRODUCT' ? item.id : null,
              sparePartId: item.itemType === 'SPARE_PART' ? item.id : null,
              quantity: parseInt(item.quantity),
              unitCost: parseFloat(item.unitCost)
            }))
          }
        }
      });

      // 3. Handle Debt & Ledger if bought on Credit!
      if (paymentStatus === 'CREDIT' || paymentStatus === 'PARTIAL') {
        let amountOwed = parseFloat(totalCost);
        
        if (paymentStatus === 'PARTIAL' && req.body.amountPaid) {
           amountOwed = amountOwed - parseFloat(req.body.amountPaid);
           await tx.distributorTransaction.create({
            data: {
              distributorId: activeDistributorId, amount: parseFloat(req.body.amountPaid), type: 'PAYMENT',
              referenceId: purchase.id, userId, description: `Partial intake payment`
            }
          });
        }

        await tx.distributor.update({
          where: { id: activeDistributorId },
          data: { balanceOwed: { increment: amountOwed } }
        });

        await tx.distributorTransaction.create({
          data: {
            distributorId: activeDistributorId,
            amount: amountOwed,
            type: 'CREDIT',
            referenceId: purchase.id,
            userId,
            description: `Stock Intake Purchase`
          }
        });
      }

      return purchase;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Failed to log inventory purchase:', error);
    res.status(500).json({ error: 'Failed to record stock intake' });
  }
};

// ==========================================
// DEBT PAYMENTS (PAYING THE DISTRIBUTOR)
// ==========================================

const recordPaymentToDistributor = async (req, res) => {
  try {
    const { id: distributorId } = req.params;
    const { amount, description } = req.body;
    const userId = req.user.id;

    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Valid payment amount is required' });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Decrease what we owe the distributor
      const updatedSupplier = await tx.distributor.update({
        where: { id: distributorId },
        data: { balanceOwed: { decrement: parseFloat(amount) } }
      });

      // 2. Log exactly when and who paid the debt
      const record = await tx.distributorTransaction.create({
        data: {
          distributorId,
          amount: parseFloat(amount),
          type: 'PAYMENT',
          description: description || 'Cash Payment / Settlement',
          userId
        }
      });

      return { supplier: updatedSupplier, transaction: record };
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Error logging payment to distributor:', error);
    res.status(500).json({ error: 'Failed to record payment' });
  }
};

module.exports = {
  getDistributors,
  getDistributorById,
  createDistributor,
  recordInventoryPurchase,
  recordPaymentToDistributor
};
