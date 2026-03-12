const prisma = require('../config/db');
const { generateInvoiceNumber } = require('../utils/generateInvoiceNumber');
const { generateInvoicePDF } = require('../services/invoice.service');

// Create invoice for a sale
const createSaleInvoice = async (req, res, next) => {
  try {
    const { saleId, tax = 0 } = req.body;

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { customer: true, items: { include: { product: true } }, invoice: true },
    });

    if (!sale) return res.status(404).json({ message: 'Sale not found.' });
    if (sale.invoice) return res.status(400).json({ message: 'Invoice already exists for this sale.' });

    const grandTotal = parseFloat(sale.totalAmount) + parseFloat(tax);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        type: 'new_sale',
        saleId,
        totalAmount: sale.totalAmount,
        tax: parseFloat(tax),
        grandTotal,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// Create invoice for second-hand sale
const createSecondHandInvoice = async (req, res, next) => {
  try {
    const { secondHandSaleId, tax = 0 } = req.body;

    const sale = await prisma.secondHandSale.findUnique({
      where: { id: secondHandSaleId },
      include: { intake: true, invoice: true },
    });

    if (!sale) return res.status(404).json({ message: 'Second-hand sale not found.' });
    if (sale.invoice) return res.status(400).json({ message: 'Invoice already exists.' });

    const grandTotal = parseFloat(sale.sellingPrice) + parseFloat(tax);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        type: 'secondhand_sale',
        secondHandSaleId,
        totalAmount: sale.sellingPrice,
        tax: parseFloat(tax),
        grandTotal,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// Create invoice for repair
const createRepairInvoice = async (req, res, next) => {
  try {
    const { repairId, tax = 0 } = req.body;

    const repair = await prisma.repair.findUnique({
      where: { id: repairId },
      include: { customer: true, parts: { include: { sparePart: true } }, invoice: true },
    });

    if (!repair) return res.status(404).json({ message: 'Repair not found.' });
    if (repair.invoice) return res.status(400).json({ message: 'Invoice already exists.' });

    const totalAmount = parseFloat(repair.serviceCharge || 0);
    const grandTotal = totalAmount + parseFloat(tax);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: await generateInvoiceNumber(),
        type: 'repair',
        repairId,
        totalAmount,
        tax: parseFloat(tax),
        grandTotal,
      },
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
};

// Get all invoices
const getInvoices = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (type) where.type = type;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          sale: { include: { customer: true } },
          secondHandSale: { include: { intake: true } },
          repair: { include: { customer: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({ invoices, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    next(error);
  }
};

// Get invoice by ID
const getInvoice = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        sale: { include: { customer: true, items: { include: { product: true } } } },
        secondHandSale: { include: { intake: { include: { customer: true } } } },
        repair: { include: { customer: true, parts: { include: { sparePart: true } } } },
      },
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });
    res.json(invoice);
  } catch (error) {
    next(error);
  }
};

// Generate PDF for invoice
const getInvoicePDF = async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        sale: { include: { customer: true, items: { include: { product: true } } } },
        secondHandSale: { include: { intake: { include: { customer: true } } } },
        repair: { include: { customer: true, parts: { include: { sparePart: true } } } },
      },
    });

    if (!invoice) return res.status(404).json({ message: 'Invoice not found.' });

    const pdfBuffer = await generateInvoicePDF(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${invoice.invoiceNumber}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSaleInvoice, createSecondHandInvoice, createRepairInvoice,
  getInvoices, getInvoice, getInvoicePDF,
};
