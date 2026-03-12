const path = require('path');
const PdfPrinter = require('pdfmake');

const fonts = {
  Roboto: {
    normal: 'node_modules/pdfmake/build/vfs_fonts.js',
  },
};

const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Determine customer & line items based on invoice type
      let customerName = 'N/A';
      let customerPhone = 'N/A';
      let lineItems = [];

      if (invoice.type === 'new_sale' && invoice.sale) {
        customerName = invoice.sale.customer.name;
        customerPhone = invoice.sale.customer.phone;
        lineItems = invoice.sale.items.map((item, i) => [
          (i + 1).toString(),
          item.product.name,
          item.quantity.toString(),
          `₹${parseFloat(item.unitPrice).toFixed(2)}`,
          `₹${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}`,
        ]);
      } else if (invoice.type === 'secondhand_sale' && invoice.secondHandSale) {
        const intake = invoice.secondHandSale.intake;
        customerName = invoice.secondHandSale.buyerName;
        customerPhone = invoice.secondHandSale.buyerPhone;
        lineItems = [
          ['1', `${intake.brand} ${intake.model} (Used - ${intake.condition})`, '1',
           `₹${parseFloat(invoice.secondHandSale.sellingPrice).toFixed(2)}`,
           `₹${parseFloat(invoice.secondHandSale.sellingPrice).toFixed(2)}`],
        ];
      } else if (invoice.type === 'repair' && invoice.repair) {
        customerName = invoice.repair.customer.name;
        customerPhone = invoice.repair.customer.phone;
        lineItems = [
          ['1', `Repair: ${invoice.repair.deviceBrand} ${invoice.repair.deviceModel}`, '1',
           `₹${parseFloat(invoice.repair.serviceCharge || 0).toFixed(2)}`,
           `₹${parseFloat(invoice.repair.serviceCharge || 0).toFixed(2)}`],
        ];
        // Add parts
        if (invoice.repair.parts) {
          invoice.repair.parts.forEach((part, i) => {
            lineItems.push([
              (i + 2).toString(),
              `Part: ${part.sparePart.name}`,
              part.quantity.toString(),
              `₹${parseFloat(part.unitCost).toFixed(2)}`,
              `₹${(parseFloat(part.unitCost) * part.quantity).toFixed(2)}`,
            ]);
          });
        }
      }

      const docDefinition = {
        content: [
          { text: 'ORANGE MOBILE RETAIL', style: 'brand', alignment: 'center' },
          { text: 'Mobile Retail Solutions', style: 'tagline', alignment: 'center' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 1, lineColor: '#4F46E5' }] },
          { text: ' ' },
          {
            columns: [
              {
                width: '50%',
                stack: [
                  { text: 'INVOICE', style: 'invoiceTitle' },
                  { text: `Invoice #: ${invoice.invoiceNumber}`, style: 'invoiceInfo' },
                  { text: `Date: ${new Date(invoice.createdAt).toLocaleDateString('en-IN')}`, style: 'invoiceInfo' },
                  { text: `Type: ${invoice.type.replace(/_/g, ' ').toUpperCase()}`, style: 'invoiceInfo' },
                ],
              },
              {
                width: '50%',
                alignment: 'right',
                stack: [
                  { text: 'Bill To:', style: 'subheader' },
                  { text: customerName, style: 'customerInfo' },
                  { text: customerPhone, style: 'customerInfo' },
                ],
              },
            ],
          },
          { text: ' ' },
          {
            table: {
              headerRows: 1,
              widths: [30, '*', 50, 80, 80],
              body: [
                [
                  { text: '#', style: 'tableHeader' },
                  { text: 'Item', style: 'tableHeader' },
                  { text: 'Qty', style: 'tableHeader' },
                  { text: 'Price', style: 'tableHeader' },
                  { text: 'Total', style: 'tableHeader' },
                ],
                ...lineItems,
              ],
            },
            layout: {
              fillColor: (rowIndex) => (rowIndex === 0 ? '#4F46E5' : rowIndex % 2 === 0 ? '#F9FAFB' : null),
            },
          },
          { text: ' ' },
          {
            columns: [
              { width: '*', text: '' },
              {
                width: 'auto',
                table: {
                  body: [
                    ['Subtotal:', `₹${parseFloat(invoice.totalAmount).toFixed(2)}`],
                    ['Tax:', `₹${parseFloat(invoice.tax).toFixed(2)}`],
                    [{ text: 'Grand Total:', bold: true, fontSize: 13 }, { text: `₹${parseFloat(invoice.grandTotal).toFixed(2)}`, bold: true, fontSize: 13 }],
                  ],
                },
                layout: 'noBorders',
              },
            ],
          },
          { text: ' ' },
          { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 515, y2: 5, lineWidth: 0.5, lineColor: '#D1D5DB' }] },
          { text: 'Thank you for your business!', style: 'footer', alignment: 'center' },
          { text: 'Orange Mobile Retail Solutions', style: 'footerSmall', alignment: 'center' },
        ],
        styles: {
          brand: { fontSize: 24, bold: true, color: '#4F46E5' },
          tagline: { fontSize: 10, color: '#6B7280', margin: [0, 0, 0, 10] },
          invoiceTitle: { fontSize: 20, bold: true, color: '#1F2937' },
          invoiceInfo: { fontSize: 10, color: '#4B5563', margin: [0, 2, 0, 0] },
          subheader: { fontSize: 12, bold: true, color: '#4B5563' },
          customerInfo: { fontSize: 10, color: '#6B7280', margin: [0, 2, 0, 0] },
          tableHeader: { bold: true, fontSize: 10, color: 'white' },
          footer: { fontSize: 12, color: '#4F46E5', margin: [0, 20, 0, 5] },
          footerSmall: { fontSize: 8, color: '#9CA3AF' },
        },
        defaultStyle: { fontSize: 10 },
      };

      // Generate PDF buffer
      const printer = new PdfPrinter({
        Roboto: {
          normal: path.join(__dirname, '../../node_modules/pdfmake/build/fonts/Roboto/Roboto-Regular.ttf'),
          bold: path.join(__dirname, '../../node_modules/pdfmake/build/fonts/Roboto/Roboto-Medium.ttf'),
          italic: path.join(__dirname, '../../node_modules/pdfmake/build/fonts/Roboto/Roboto-Italic.ttf'),
          bolditalic: path.join(__dirname, '../../node_modules/pdfmake/build/fonts/Roboto/Roboto-MediumItalic.ttf')
        }
      });

      // Simple Doc Definition for server-side
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      let chunks = [];
      pdfDoc.on('data', (chunk) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', (err) => reject(err));
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
