// const express = require("express");
// const router = express.Router();
// const generatePDF = require("../utils/generatePDF");
// const auth = require("../middleware/authMiddleware");
// const Invoice = require("../models/InvoiceSchema");
// const { drive, oauth2Client , uploadInvoice,
//   createDocuGenFolder,
//   listFiles,
//   renameFile,
//   setCredentials } = require("../utils/googleDrive");
// const User = require("../models/user");

// const { Readable } = require("stream");

// router.post("/download", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // 🔹 Get last invoice number
//     const lastInvoice = await Invoice.findOne({ userId }).sort({
//       invoiceNo: -1,
//     });

//     const newInvoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1;

//     // 🔹 Prepare invoice data
//     const invoiceData = {
//       userId,
//       invoiceNo: newInvoiceNo,
//       client: req.body.client,
//       date: req.body.date,
//       items: req.body.items,
//       total: req.body.total,
//     };

//     // 🔹 Save to DB
//     await Invoice.create(invoiceData);

//     // 🔹 Generate PDF (Buffer)
//     const pdf = await generatePDF(invoiceData);

//     // 🔹 Get user Google tokens
//     const user = await User.findById(userId);

//     if (!user || !user.googleTokens) {
//       return res.status(400).json({
//         error: "Google Drive not connected",
//       });
//     }

//     oauth2Client.setCredentials(user.googleTokens);

//     // 🔹 Convert Buffer → Readable Stream (IMPORTANT FIX)
//     const bufferStream = new Readable();
//     bufferStream.push(pdf);
//     bufferStream.push(null);

//     // 🔹 Check if DocuGen folder exists
//     const folderQuery = await drive.files.list({
//       q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder'",
//       fields: "files(id, name)",
//     });

//     let folderId;

//     if (folderQuery.data.files.length === 0) {
//       const folder = await drive.files.create({
//         requestBody: {
//           name: "DocuGen",
//           mimeType: "application/vnd.google-apps.folder",
//         },
//       });
//       folderId = folder.data.id;
//     } else {
//       folderId = folderQuery.data.files[0].id;
//     }

//     // 🔹 Upload to Google Drive
//     await drive.files.create({
//       requestBody: {
//         name: `invoice-${newInvoiceNo}.pdf`,
//         parents: [folderId],
//       },
//       media: {
//         mimeType: "application/pdf",
//         body: bufferStream, // ✅ FIXED
//       },
//     });

//     // 🔹 Send PDF to frontend
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=invoice-${newInvoiceNo}.pdf`,
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("Invoice Error:", err);
//     res.status(500).json({ error: "Invoice generation failed" });
//   }
// });

// /**
//  * 📌 Preview Invoice (No DB Save)
//  */
// router.post("/preview", auth, async (req, res) => {
//   try {
//     const pdf = await generatePDF(req.body);

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "inline; filename=preview.pdf",
//     });

//     return res.send(pdf);
//   } catch (err) {
//     console.error("Preview Error:", err);
//     return res.status(500).json({ error: "Preview failed" });
//   }
// });

// /**
//  * 📌 Get All Invoices of Logged-in User
//  */
// router.get("/my-invoices", auth, async (req, res) => {
//   try {
//     const invoices = await Invoice.find({ userId: req.user.id }).sort({
//       createdAt: -1,
//     });

//     return res.json(invoices);
//   } catch (err) {
//     console.error("Fetch Invoices Error:", err);
//     return res.status(500).json({ error: "Failed to fetch invoices" });
//   }
// });

// /**
//  * 📌 Delete Invoice
//  */
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const invoice = await Invoice.findOneAndDelete({
//       _id: req.params.id,
//       userId: req.user.id,
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found" });
//     }

//     return res.json({ message: "Invoice deleted successfully" });
//   } catch (err) {
//     console.error("Delete Invoice Error:", err);
//     return res.status(500).json({ error: "Delete failed" });
//   }
// });
// router.get("/drive-files", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const user = await User.findById(userId);

//     if (!user || !user.googleTokens) {
//       return res.status(400).json({
//         error: "Google Drive not connected",
//       });
//     }

//     oauth2Client.setCredentials(user.googleTokens);

//     // Find DocuGen folder
//     const folderQuery = await drive.files.list({
//       q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder'",
//       fields: "files(id, name)",
//     });

//     if (folderQuery.data.files.length === 0) {
//       return res.json([]);
//     }

//     const folderId = folderQuery.data.files[0].id;

//     // Get files inside folder
//     // const files = await drive.files.list({
//     //   q: `'${folderId}' in parents and trashed=false`,
//     //   fields: "files(id, name, webViewLink, createdTime, size)",
//     //   orderBy: "createdTime desc",
//     // });

//     const files = await drive.files.list({
//   q: `'${folderId}' in parents and trashed=false`,
//   fields: "files(id, name, webViewLink, createdTime)",
// });

//     res.json(files.data.files);
//   } catch (err) {
//     console.error("Drive Fetch Error:", err);
//     res.status(500).json({ error: "Failed to fetch Drive files" });
//   }
// });

// // rename file


// module.exports = router;
// const express = require("express");
// const router = express.Router();
// const generatePDF = require("../utils/generatePDF");
// const auth = require("../middleware/authMiddleware");
// const Invoice = require("../models/InvoiceSchema");
// const { drive, oauth2Client, setCredentials } = require("../utils/googleDrive");
// const User = require("../models/user");
// const { Readable } = require("stream");

// // Helper function to generate invoice number
// async function generateInvoiceNumber(userId) {
//   const lastInvoice = await Invoice.findOne({ userId }).sort({ invoiceNo: -1 });
//   return lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
// }

// router.post("/download", auth, async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const invoiceNo = await generateInvoiceNumber(userId);

//     // Enhanced invoice data with more fields
//     const invoiceData = {
//       userId,
//       invoiceNo,
//       client: req.body.client,
//       clientEmail: req.body.clientEmail || "",
//       clientPhone: req.body.clientPhone || "",
//       company: req.body.company || "",
//       date: new Date().toLocaleDateString('en-IN'),
//       dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
//       items: req.body.items,
//       subtotal: req.body.total,
//       total: req.body.total * 1.18, // Adding 18% GST
//       gst: req.body.total * 0.18
//     };

//     // Save to database
//     await Invoice.create(invoiceData);

//     // Generate PDF with enhanced data
//     const pdf = await generatePDF(invoiceData);

//     // Upload to Google Drive if connected
//     const user = await User.findById(userId);
//     if (user && user.googleTokens) {
//       try {
//         oauth2Client.setCredentials(user.googleTokens);
        
//         // Find or create DocuGen folder
//         const folderQuery = await drive.files.list({
//           q: "name='DocuGen_Invoices' and mimeType='application/vnd.google-apps.folder' and trashed=false",
//           fields: "files(id, name)"
//         });

//         let folderId;
//         if (folderQuery.data.files.length === 0) {
//           const folder = await drive.files.create({
//             requestBody: {
//               name: "DocuGen_Invoices",
//               mimeType: "application/vnd.google-apps.folder"
//             }
//           });
//           folderId = folder.data.id;
//         } else {
//           folderId = folderQuery.data.files[0].id;
//         }

//         // Upload to Drive
//         const bufferStream = new Readable();
//         bufferStream.push(pdf);
//         bufferStream.push(null);

//         await drive.files.create({
//           requestBody: {
//             name: `INVOICE-${invoiceNo}-${invoiceData.client}.pdf`,
//             parents: [folderId]
//           },
//           media: {
//             mimeType: "application/pdf",
//             body: bufferStream
//           }
//         });
//       } catch (driveErr) {
//         console.error("Drive upload failed:", driveErr.message);
//         // Don't fail the request if Drive upload fails
//       }
//     }

//     // Send PDF to client
//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": `attachment; filename=INVOICE-${invoiceNo}.pdf`,
//       "X-Invoice-Number": invoiceNo
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("Invoice Error:", err);
//     res.status(500).json({ error: "Invoice generation failed: " + err.message });
//   }
// });

// // Preview invoice without saving
// router.post("/preview", auth, async (req, res) => {
//   try {
//     const previewData = {
//       invoiceNo: req.body.invoiceNo || "PREVIEW",
//       client: req.body.client,
//       clientEmail: req.body.clientEmail,
//       clientPhone: req.body.clientPhone,
//       company: req.body.company,
//       date: new Date().toLocaleDateString('en-IN'),
//       dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
//       items: req.body.items,
//       subtotal: req.body.total,
//       total: req.body.total * 1.18,
//       gst: req.body.total * 0.18
//     };

//     const pdf = await generatePDF(previewData);

//     res.set({
//       "Content-Type": "application/pdf",
//       "Content-Disposition": "inline; filename=preview.pdf"
//     });

//     res.send(pdf);
//   } catch (err) {
//     console.error("Preview Error:", err);
//     res.status(500).json({ error: "Preview failed" });
//   }
// });

// // Get all invoices
// router.get("/my-invoices", auth, async (req, res) => {
//   try {
//     const invoices = await Invoice.find({ userId: req.user.id })
//       .sort({ createdAt: -1 })
//       .select('-__v');
    
//     res.json(invoices);
//   } catch (err) {
//     console.error("Fetch Invoices Error:", err);
//     res.status(500).json({ error: "Failed to fetch invoices" });
//   }
// });

// // Delete invoice
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const invoice = await Invoice.findOneAndDelete({
//       _id: req.params.id,
//       userId: req.user.id
//     });

//     if (!invoice) {
//       return res.status(404).json({ error: "Invoice not found" });
//     }

//     res.json({ message: "Invoice deleted successfully" });
//   } catch (err) {
//     console.error("Delete Invoice Error:", err);
//     res.status(500).json({ error: "Delete failed" });
//   }
// });

// module.exports = router;

// backend/routes/invoiceRoute.js
const express = require("express");
const router = express.Router();
const generatePDF = require("../utils/generatePDF"); // Use the working version
const auth = require("../middleware/authMiddleware");
const Invoice = require("../models/InvoiceSchema");
const { drive, oauth2Client } = require("../utils/googleDrive");
const User = require("../models/user");
const { Readable } = require("stream");

async function generateInvoiceNumber(userId) {
  const lastInvoice = await Invoice.findOne({ userId }).sort({ createdAt: -1 });
  return lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
}

router.put("/rename-file/:fileId", auth, async (req, res) => {
  try {
    const { fileId } = req.params;
    const { newName } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user.googleTokens) {
      return res.status(400).json({ message: "Google not connected" });
    }
    
    oauth2Client.setCredentials(user.googleTokens);
    
    // Update file name in Google Drive
    await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName
      }
    });
    
    res.json({ message: "File renamed successfully" });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ message: "Failed to rename file" });
  }
});

// Main download endpoint - FIXED
// router.post("/download", auth, async (req, res) => {
//   try {
//     console.log('Received invoice request:', req.body);
    
//     const userId = req.user.id;
//     const invoiceNo = await generateInvoiceNumber(userId);
    
//     // Calculate totals
//     const subtotal = Number(req.body.total) || 0;
//     const gst = subtotal * 0.18;
//     const grandTotal = subtotal + gst;
    
//     const invoiceData = {
//       userId,
//       invoiceNo,
//       client: req.body.client || 'N/A',
//       clientEmail: req.body.clientEmail || '',
//       clientPhone: req.body.clientPhone || '',
//       company: req.body.company || 'DocuGen Inc.',
//       date: new Date().toLocaleDateString('en-IN'),
//       dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
//       items: req.body.items || [],
//       subtotal: subtotal,
//       gst: gst,
//       total: grandTotal
//     };
    
//     console.log('Generating PDF for invoice:', invoiceNo);
    
//     // Generate PDF
//     const pdf = await generatePDF(invoiceData);
    
//     if (!pdf || pdf.length === 0) {
//       throw new Error('PDF generation returned empty data');
//     }
    
//     console.log('PDF generated successfully, size:', pdf.length, 'bytes');
    
//     // Save to database
//     try {
//       await Invoice.create(invoiceData);
//       console.log('Invoice saved to database');
//     } catch (dbErr) {
//       console.error('Database save error:', dbErr.message);
//       // Don't fail the request if DB save fails
//     }
    
//     // Upload to Google Drive if user has tokens
//     try {
//       const user = await User.findById(userId);
//       if (user?.googleTokens) {
//         oauth2Client.setCredentials(user.googleTokens);
        
//         const folderQuery = await drive.files.list({
//           q: "name='DocuGen_Invoices' and mimeType='application/vnd.google-apps.folder' and trashed=false",
//           fields: "files(id, name)",
//         });
        
//         let folderId;
//         if (folderQuery.data.files.length === 0) {
//           const folder = await drive.files.create({
//             requestBody: {
//               name: "DocuGen_Invoices",
//               mimeType: "application/vnd.google-apps.folder",
//             },
//           });
//           folderId = folder.data.id;
//         } else {
//           folderId = folderQuery.data.files[0].id;
//         }
        
//         const bufferStream = new Readable();
//         bufferStream.push(pdf);
//         bufferStream.push(null);
        
//         await drive.files.create({
//           requestBody: {
//             name: `INVOICE-${invoiceNo}.pdf`,
//             parents: [folderId],
//           },
//           media: {
//             mimeType: "application/pdf",
//             body: bufferStream,
//           },
//         });
//         console.log('Invoice uploaded to Drive');
//       }
//     } catch (driveErr) {
//       console.error('Drive upload failed:', driveErr.message);
//     }
    
//     // Send PDF to client
//     res.set({
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': `attachment; filename=INVOICE-${invoiceNo}.pdf`,
//       'Content-Length': pdf.length
//     });
    
//     res.send(pdf);
    
//   } catch (err) {
//     console.error('Invoice Error:', err);
//     res.status(500).json({ 
//       error: 'Invoice generation failed', 
//       details: err.message
//     });
//   }
// });
// In invoiceRoute.js, update the download endpoint to handle uploadToDrive
router.post("/download", auth, async (req, res) => {
  try {
    console.log('Received invoice request:', req.body);
    
    const userId = req.user.id;
    const uploadToDrive = req.body.uploadToDrive || false; // Get upload preference
    
    const lastInvoice = await Invoice.findOne({ userId }).sort({ invoiceNo: -1 });
    const newInvoiceNo = lastInvoice ? lastInvoice.invoiceNo + 1 : 1001;
    
    const subtotal = req.body.total || 0;
    const gst = subtotal * 0.18;
    const totalWithGst = subtotal + gst;
    
    const invoiceData = {
      userId,
      invoiceNo: newInvoiceNo,
      client: req.body.client || 'N/A',
      clientEmail: req.body.clientEmail || '',
      clientPhone: req.body.clientPhone || '',
      company: req.body.company || 'DocuGen Inc.',
      date: new Date().toLocaleDateString('en-IN'),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      items: req.body.items || [],
      subtotal: subtotal,
      gst: gst,
      total: totalWithGst
    };
    
    const pdf = await generatePDF(invoiceData);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('PDF generation returned empty data');
    }
    
    // Save to database
    await Invoice.create(invoiceData);
    
    let driveUploaded = false;
    
    // Upload to Google Drive ONLY if user selected the option
    if (uploadToDrive) {
      try {
        const user = await User.findById(userId);
        if (user?.googleTokens) {
          oauth2Client.setCredentials(user.googleTokens);
          
          const folderQuery = await drive.files.list({
            q: "name='DocuGen' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: "files(id, name)",
          });
          
          let folderId;
          if (folderQuery.data.files.length === 0) {
            const folder = await drive.files.create({
              requestBody: {
                name: "DocuGen",
                mimeType: "application/vnd.google-apps.folder",
              },
            });
            folderId = folder.data.id;
          } else {
            folderId = folderQuery.data.files[0].id;
          }
          
          const bufferStream = new Readable();
          bufferStream.push(pdf);
          bufferStream.push(null);
          
          await drive.files.create({
            requestBody: {
              name: `INVOICE-${newInvoiceNo}.pdf`,
              parents: [folderId],
            },
            media: {
              mimeType: "application/pdf",
              body: bufferStream,
            },
          });
          
          driveUploaded = true;
          console.log('Invoice uploaded to Drive');
        } else {
          console.log('Drive not connected, skipping upload');
        }
      } catch (driveErr) {
        console.error('Drive upload failed:', driveErr.message);
        // Don't fail the request if Drive upload fails
      }
    }
    
    // Send PDF with headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=INVOICE-${newInvoiceNo}.pdf`,
      'Content-Length': pdf.length,
      'X-Drive-Uploaded': driveUploaded.toString() // Send upload status in header
    });
    
    res.send(pdf);
    
  } catch (err) {
    console.error('Invoice Error:', err);
    res.status(500).json({ 
      error: 'Invoice generation failed', 
      details: err.message
    });
  }
});

// Preview endpoint - FIXED
router.post("/preview", auth, async (req, res) => {
  try {
    console.log('Preview request received');
    
    const subtotal = Number(req.body.total) || 0;
    const gst = subtotal * 0.18;
    const grandTotal = subtotal + gst;
    
    const previewData = {
      invoiceNo: req.body.invoiceNo || "PREVIEW",
      client: req.body.client || 'N/A',
      clientEmail: req.body.clientEmail || '',
      clientPhone: req.body.clientPhone || '',
      company: req.body.company || 'DocuGen Inc.',
      date: new Date().toLocaleDateString('en-IN'),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      items: req.body.items || [],
      subtotal: subtotal,
      gst: gst,
      total: grandTotal
    };
    
    const pdf = await generatePDF(previewData);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('PDF generation returned empty data');
    }
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=preview.pdf',
      'Content-Length': pdf.length
    });
    
    res.send(pdf);
    
  } catch (err) {
    console.error('Preview Error:', err);
    res.status(500).json({ 
      error: 'Preview failed', 
      details: err.message 
    });
  }
});

// Get user's invoices
router.get("/my-invoices", auth, async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('Fetch invoices error:', err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// Delete invoice
router.delete("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    
    if (!invoice) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    
    res.json({ message: "Invoice deleted successfully" });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: "Delete failed" });
  }
});

// Test endpoint (keep for testing)
router.get("/test-pdf", auth, async (req, res) => {
  try {
    const testData = {
      invoiceNo: "TEST001",
      client: "Test Client",
      clientEmail: "test@example.com",
      clientPhone: "1234567890",
      company: "Test Company",
      date: new Date().toLocaleDateString('en-IN'),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
      items: [{ name: "Test Item", qty: 1, price: 1000 }],
      subtotal: 1000,
      gst: 180,
      total: 1180
    };
    
    const pdf = await generatePDF(testData);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename=test.pdf',
      'Content-Length': pdf.length
    });
    
    res.send(pdf);
  } catch (err) {
    console.error('Test PDF error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;