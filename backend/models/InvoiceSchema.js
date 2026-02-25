const mongoose = require("mongoose");
const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNo: {
      type: Number,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    date: {
      type: String,
    },
    items: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// 🚀 Important: Prevent duplicate invoice numbers per user
invoiceSchema.index({ userId: 1, invoiceNo: 1 }, { unique: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
