const prisma = require('../config/db');

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `ORANGE-${year}-`;

  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(5, '0')}`;
};

module.exports = { generateInvoiceNumber };
