const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = (order, items, filePath) => {
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text('Shopey Receipt', { align: 'center' });

  doc.moveDown();
  doc.text(`Order Code: ${order.order_code}`);
  doc.text(`Total: KES ${order.total_amount}`);
  doc.text(`Delivery Fee: KES ${order.delivery_fee}`);
  doc.text(`Date: ${order.created_at}`);

  doc.moveDown();
  doc.text('Items:');

  items.forEach(item => {
    doc.text(`${item.name} x${item.quantity} - KES ${item.price}`);
  });

  doc.end();
};