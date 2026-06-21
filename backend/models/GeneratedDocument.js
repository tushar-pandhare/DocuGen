const mongoose = require('mongoose');

const generatedDocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', required: true },
  templateName: { type: String, required: true },
  documentType: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  fileUrl: { type: String },
  fileId: { type: String },
  fileName: { type: String },
  status: { 
    type: String, 
    enum: ['draft', 'generated', 'sent', 'paid'],
    default: 'generated'
  },
  metadata: {
    generatedAt: { type: Date, default: Date.now },
    generatedBy: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

generatedDocumentSchema.index({ userId: 1, templateId: 1 });
generatedDocumentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GeneratedDocument', generatedDocumentSchema);