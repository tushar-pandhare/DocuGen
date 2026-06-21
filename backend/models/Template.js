const mongoose = require('mongoose');

const templateFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['text', 'number', 'date', 'currency', 'textarea', 'image', 'signature', 'table'],
    required: true 
  },
  label: { type: String, required: true },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  defaultValue: { type: mongoose.Schema.Types.Mixed, default: '' },
  position: { type: Number, default: 0 },
  style: {
    fontSize: { type: String, default: '14px' },
    fontColor: { type: String, default: '#000000' },
    fontWeight: { type: String, default: 'normal' },
    textAlign: { type: String, default: 'left' }
  },
  options: [{ type: String }] // For dropdown/radio fields
});

const templateSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  category: { 
    type: String, 
    enum: ['invoice', 'contract', 'proposal', 'letter', 'business', 'legal', 'personal', 'custom'],
    default: 'custom',
    index: true
  },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  isPublic: { 
    type: Boolean, 
    default: false,
    index: true 
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  usageCount: { 
    type: Number, 
    default: 0 
  },
  likes: { 
    type: Number, 
    default: 0 
  },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  fields: [templateFieldSchema],
  htmlStructure: { type: String, default: '' },
  cssStyles: { type: String, default: '' },
  tags: [{ type: String }],
  sharedWith: [{ 
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' }
  }],
  version: { type: Number, default: 1 },
  parentTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Template' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for better performance
templateSchema.index({ name: 'text', description: 'text', tags: 'text' });
templateSchema.index({ category: 1, isPublic: 1, usageCount: -1 });

// Virtual for formatted data
templateSchema.virtual('formattedData').get(function() {
  return {
    id: this._id,
    name: this.name,
    category: this.category,
    fields: this.fields,
    htmlStructure: this.htmlStructure
  };
});

// Pre-save middleware
templateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Template', templateSchema);