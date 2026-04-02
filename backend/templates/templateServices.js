// backend/services/templateService-pdfkit.js
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

async function generatePDFFromTemplate(template, data) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Generating PDF for template:', template.name);
      
      const doc = new PDFDocument({ 
        margin: 50, 
        size: 'A4'
      });
      
      const chunks = [];
      
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log('PDF generated, size:', pdfBuffer.length, 'bytes');
        resolve(pdfBuffer);
      });
      doc.on('error', reject);
      
      // Helper function to format currency
      const formatMoney = (amount) => {
        if (!amount && amount !== 0) return '₹0';
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
      };
      
      // Get category-specific colors
      const getCategoryColors = (category) => {
        const colors = {
          invoice: { primary: '#4f46e5', secondary: '#1e293b', accent: '#f59e0b' },
          contract: { primary: '#3b82f6', secondary: '#1e293b', accent: '#10b981' },
          proposal: { primary: '#8b5cf6', secondary: '#1e293b', accent: '#f97316' },
          business: { primary: '#0ea5e9', secondary: '#1e293b', accent: '#f59e0b' },
          legal: { primary: '#ef4444', secondary: '#1e293b', accent: '#8b5cf6' },
          personal: { primary: '#ec4899', secondary: '#1e293b', accent: '#f43f5e' },
          default: { primary: '#4f46e5', secondary: '#1e293b', accent: '#f59e0b' }
        };
        return colors[category] || colors.default;
      };
      
      const categoryColors = getCategoryColors(template.category);
      
      // ============ HEADER SECTION ============
      // Top decorative bar
      doc.rect(0, 0, doc.page.width, 6)
         .fill(categoryColors.primary);
      
      // Header background
      doc.rect(0, 6, doc.page.width, 80)
         .fill(categoryColors.secondary);
      
      // Title
      doc.fontSize(26)
         .fillColor(categoryColors.primary)
         .font('Helvetica-Bold')
         .text(template.name || 'Document', 50, 25);
      
      // Category badge
      const categoryName = template.category || 'document';
      doc.fontSize(8)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text(categoryName.toUpperCase(), 50, 60);
      
      // Date and ID on the right
      doc.fontSize(9)
         .fillColor('#ffffff')
         .text(`Date: ${new Date().toLocaleDateString()}`, doc.page.width - 120, 30, { align: 'right' })
         .text(`ID: #${Date.now().toString().slice(-8)}`, doc.page.width - 120, 50, { align: 'right' });
      
      // ============ INFO CARD ============
      let y = 110;
      
      // Card background
      doc.roundedRect(45, y - 10, 520, 45, 8)
         .fill('#f8fafc')
         .stroke('#e2e8f0');
      
      doc.fontSize(8)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text('DOCUMENT INFORMATION', 55, y);
      
      y += 12;
      doc.fontSize(9)
         .fillColor('#334155')
         .font('Helvetica')
         .text(`Template: ${template.name}`, 55, y)
         .text(`Version: 1.0`, 280, y)
         .text(`Status: Valid`, 460, y);
      
      // ============ FIELDS SECTION ============
      y = 180;
      
      // Section header
      doc.fontSize(12)
         .fillColor(categoryColors.primary)
         .font('Helvetica-Bold')
         .text('DETAILS', 50, y);
      
      y += 8;
      doc.moveTo(50, y)
         .lineTo(120, y)
         .lineWidth(2)
         .stroke(categoryColors.primary);
      
      y += 20;
      
      const fields = template.fields || [];
      
      if (fields.length === 0) {
        doc.fontSize(10)
           .fillColor('#94a3b8')
           .text('No fields defined', 50, y);
      } else {
        // Simple, clean list layout
        for (let i = 0; i < fields.length; i++) {
          const field = fields[i];
          const value = data[field.id] || field.defaultValue || '—';
          
          // Alternate row background
          if (i % 2 === 0) {
            doc.rect(45, y - 5, 520, 45)
               .fill('#f8fafc');
          }
          
          // Field label
          doc.fontSize(9)
             .fillColor('#64748b')
             .font('Helvetica-Bold')
             .text(field.label, 55, y);
          
          // Field value
          doc.fontSize(11)
             .fillColor('#1e293b')
             .font('Helvetica')
             .text(field.type === 'currency' ? formatMoney(value) : value, 55, y + 15);
          
          y += 45;
          
          // Add new page if needed
          if (y > doc.page.height - 140) {
            doc.addPage();
            y = 50;
            
            // Re-add header on new page
            doc.rect(0, 0, doc.page.width, 6)
               .fill(categoryColors.primary);
            doc.rect(0, 6, doc.page.width, 50)
               .fill(categoryColors.secondary);
            
            doc.fontSize(20)
               .fillColor(categoryColors.primary)
               .text(template.name, 50, 20);
            
            doc.fontSize(12)
               .fillColor(categoryColors.primary)
               .text('DETAILS (CONTINUED)', 50, 90);
            
            doc.moveTo(50, 105)
               .lineTo(200, 105)
               .stroke(categoryColors.primary);
            
            y = 125;
          }
        }
      }
      
      // ============ FOOTER SECTION ============
      const footerY = doc.page.height - 80;
      
      // Signature line
      doc.moveTo(50, footerY)
         .lineTo(250, footerY)
         .stroke('#cbd5e1');
      
      doc.fontSize(8)
         .fillColor('#94a3b8')
         .text('Authorized Signature', 50, footerY + 5);
      
      // QR Code
      try {
        const qrData = JSON.stringify({
          id: Date.now(),
          template: template.name,
          date: new Date().toISOString()
        });
        
        const qrBuffer = await QRCode.toBuffer(qrData, {
          width: 60,
          margin: 1,
          color: {
            dark: categoryColors.primary,
            light: '#ffffff'
          }
        });
        
        doc.image(qrBuffer, doc.page.width - 100, footerY - 20, { width: 60 });
      } catch (err) {
        console.error('QR Error:', err.message);
      }
      
      // Footer text
      doc.fontSize(7)
         .fillColor('#cbd5e1')
         .text('Generated by DocuGen', 50, doc.page.height - 30, { align: 'center', width: doc.page.width - 100 });
      
      doc.fontSize(7)
         .fillColor('#cbd5e1')
         .text(`© ${new Date().getFullYear()} All rights reserved`, 50, doc.page.height - 20, { align: 'center', width: doc.page.width - 100 });
      
      doc.end();
      
    } catch (err) {
      console.error('PDF generation error:', err);
      reject(err);
    }
  });
}

module.exports = { generatePDFFromTemplate };