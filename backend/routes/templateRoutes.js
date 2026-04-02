const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Template = require('../models/Template');
const GeneratedDocument = require('../models/GeneratedDocument');
const { generatePDFFromTemplate } = require('../templates/templateServices');
const { Readable } = require('stream');
const { google } = require('googleapis');
// ==================== TEMPLATE CRUD ====================

// Get all templates (with filters)
router.get('/templates', auth, async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 20 } = req.query;
    
    let query = {
      $or: [
        { userId: req.user.id },
        { isPublic: true }
      ]
    };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    let sortOption = {};
    switch (sort) {
      case 'popular':
        sortOption = { usageCount: -1 };
        break;
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }
    
    const templates = await Template.find(query)
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'name email');
    
    const total = await Template.countDocuments(query);
    
    res.json({
      templates,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get single template
router.get('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id)
      .populate('userId', 'name email');
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Check access
    const hasAccess = template.userId._id.toString() === req.user.id || 
                      template.isPublic ||
                      template.sharedWith.some(s => s.userId.toString() === req.user.id);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Increment usage count
    template.usageCount += 1;
    await template.save();
    
    res.json(template);
  } catch (err) {
    console.error('Get template error:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/templates/:id/generate', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const { data } = req.body;
    const uploadToDrive = req.body.uploadToDrive || false;
    
    console.log('Generating document for template:', template.name);
    
    // Generate PDF using pdfkit
    const pdf = await generatePDFFromTemplate(template, data);
    
    if (!pdf || pdf.length === 0) {
      throw new Error('PDF generation returned empty data');
    }
    
    console.log('PDF generated successfully, size:', pdf.length, 'bytes');
    
    let driveFileId = null;
    
    // Upload to Google Drive if requested
    if (uploadToDrive) {
      try {
        const User = require('../models/user');
        const { google } = require('googleapis');
        const { Readable } = require('stream');
        
        const user = await User.findById(req.user.id);
        if (user && user.googleTokens) {
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
          );
          oauth2Client.setCredentials(user.googleTokens);
          
          const drive = google.drive({ version: 'v3', auth: oauth2Client });
          
          // Find or create DocuGen folder
          const folderQuery = await drive.files.list({
            q: "name='DocuGen_Documents' and mimeType='application/vnd.google-apps.folder' and trashed=false",
            fields: 'files(id, name)'
          });
          
          let folderId;
          if (folderQuery.data.files.length === 0) {
            const folder = await drive.files.create({
              requestBody: {
                name: 'DocuGen_Documents',
                mimeType: 'application/vnd.google-apps.folder'
              }
            });
            folderId = folder.data.id;
          } else {
            folderId = folderQuery.data.files[0].id;
          }
          
          const bufferStream = new Readable();
          bufferStream.push(pdf);
          bufferStream.push(null);
          
          const fileName = `${template.name.replace(/\s/g, '_')}_${Date.now()}.pdf`;
          
          const fileResponse = await drive.files.create({
            requestBody: {
              name: fileName,
              parents: [folderId]
            },
            media: {
              mimeType: 'application/pdf',
              body: bufferStream
            }
          });
          
          driveFileId = fileResponse.data.id;
          console.log('PDF uploaded to Google Drive');
        }
      } catch (driveErr) {
        console.error('Drive upload failed:', driveErr.message);
      }
    }
    
    // Save generated document record
    try {
      const GeneratedDocument = require('../models/GeneratedDocument');
      await GeneratedDocument.create({
        userId: req.user.id,
        templateId: template._id,
        templateName: template.name,
        documentType: template.category,
        data: data,
        fileId: driveFileId,
        fileName: `${template.name}_${Date.now()}.pdf`,
        status: 'generated'
      });
    } catch (dbErr) {
      console.error('Database save error:', dbErr.message);
    }
    
    // Send PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${template.name.replace(/\s/g, '_')}_${Date.now()}.pdf"`,
      'Content-Length': pdf.length,
      'X-Drive-Uploaded': driveFileId ? 'true' : 'false'
    });
    
    res.send(pdf);
    
  } catch (err) {
    console.error('Generate document error:', err);
    res.status(500).json({ 
      error: 'Document generation failed', 
      details: err.message 
    });
  }
});


// Create template
router.post('/templates', auth, async (req, res) => {
  try {
    const template = await Template.create({
      userId: req.user.id,
      ...req.body
    });
    
    res.status(201).json(template);
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update template
router.put('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Check ownership or edit permission
    const hasEditPermission = template.userId.toString() === req.user.id ||
                              template.sharedWith.some(s => 
                                s.userId.toString() === req.user.id && s.permission === 'edit');
    
    if (!hasEditPermission) {
      return res.status(403).json({ error: 'Edit permission denied' });
    }
    
    const updatedTemplate = await Template.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json(updatedTemplate);
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete template
router.delete('/templates/:id', auth, async (req, res) => {
  try {
    const template = await Template.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found or unauthorized' });
    }
    
    res.json({ message: 'Template deleted successfully' });
  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== TEMPLATE SHARING ====================

// Share template with user
router.post('/templates/:id/share', auth, async (req, res) => {
  try {
    const { email, permission = 'view' } = req.body;
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Only owner can share
    if (template.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can share template' });
    }
    
    // Find user by email
    const User = require('../models/user');
    const userToShare = await User.findOne({ email });
    
    if (!userToShare) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already shared
    const alreadyShared = template.sharedWith.some(s => s.userId.toString() === userToShare._id.toString());
    
    if (alreadyShared) {
      return res.status(400).json({ error: 'Template already shared with this user' });
    }
    
    template.sharedWith.push({
      userId: userToShare._id,
      permission
    });
    
    await template.save();
    
    res.json({ message: 'Template shared successfully', sharedWith: template.sharedWith });
  } catch (err) {
    console.error('Share template error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Remove sharing
router.delete('/templates/:id/share/:userId', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (template.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only owner can manage sharing' });
    }
    
    template.sharedWith = template.sharedWith.filter(
      s => s.userId.toString() !== req.params.userId
    );
    
    await template.save();
    
    res.json({ message: 'Share removed successfully' });
  } catch (err) {
    console.error('Remove share error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== GENERATE DOCUMENT ====================

// Generate document from template
router.post('/templates/:id/generate', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const { data } = req.body;
    
    // Generate PDF from template
    const pdf = await generatePDFFromTemplate(template, data);
    
    // Save generated document record
    const document = await GeneratedDocument.create({
      userId: req.user.id,
      templateId: template._id,
      templateName: template.name,
      documentType: template.category,
      data: data,
      fileName: `${template.name}_${Date.now()}.pdf`
    });
    
    // Send PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${template.name}_${Date.now()}.pdf`
    });
    
    res.send(pdf);
  } catch (err) {
    console.error('Generate document error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user's generated documents
router.get('/documents', auth, async (req, res) => {
  try {
    const documents = await GeneratedDocument.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(documents);
  } catch (err) {
    console.error('Get documents error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== TEMPLATE STATS ====================

// Get template stats
router.get('/templates/stats/overview', auth, async (req, res) => {
  try {
    const totalTemplates = await Template.countDocuments({ userId: req.user.id });
    const publicTemplates = await Template.countDocuments({ userId: req.user.id, isPublic: true });
    const totalGenerated = await GeneratedDocument.countDocuments({ userId: req.user.id });
    const popularTemplate = await Template.findOne({ userId: req.user.id })
      .sort({ usageCount: -1 });
    
    const categoryStats = await Template.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalTemplates,
      publicTemplates,
      totalGenerated,
      popularTemplate: popularTemplate ? popularTemplate.name : null,
      categoryStats
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Like/Unlike template
router.post('/templates/:id/like', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const likedIndex = template.likedBy.indexOf(req.user.id);
    
    if (likedIndex === -1) {
      template.likedBy.push(req.user.id);
      template.likes += 1;
    } else {
      template.likedBy.splice(likedIndex, 1);
      template.likes -= 1;
    }
    
    await template.save();
    
    res.json({ likes: template.likes, liked: likedIndex === -1 });
  } catch (err) {
    console.error('Like template error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;