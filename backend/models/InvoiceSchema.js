// const mongoose = require("mongoose");
// const invoiceSchema = new mongoose.Schema(
//   {
//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     invoiceNo: {
//       type: Number,
//       required: true,
//     },
//     client: {
//       type: String,
//       required: true,
//     },
//     date: {
//       type: String,
//     },
//     items: {
//       type: Array,
//       required: true,
//     },
//     total: {
//       type: Number,
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// // 🚀 Important: Prevent duplicate invoice numbers per user
// invoiceSchema.index({ userId: 1, invoiceNo: 1 }, { unique: true });

// module.exports = mongoose.model("Invoice", invoiceSchema);
const mongoose = require("mongoose");

const invoiceItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true }
});

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    invoiceNo: {
      type: Number,
      required: true,
      index: true
    },
    client: {
      type: String,
      required: true
    },
    clientEmail: {
      type: String,
      default: ""
    },
    clientPhone: {
      type: String,
      default: ""
    },
    company: {
      type: String,
      default: ""
    },
    date: {
      type: String,
      required: true
    },
    dueDate: {
      type: String,
      required: true
    },
    items: [invoiceItemSchema],
    subtotal: {
      type: Number,
      required: true
    },
    gst: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['paid', 'pending', 'overdue'],
      default: 'pending'
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// Compound index for unique invoice numbers per user
invoiceSchema.index({ userId: 1, invoiceNo: 1 }, { unique: true });

// Virtual for formatted total
invoiceSchema.virtual('formattedTotal').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(this.total);
});

module.exports = mongoose.model("Invoice", invoiceSchema);