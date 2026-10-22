const mongoose = require("mongoose");

const aiDocumentChunkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    charCount: {
      type: Number,
      required: true,
    },
    uploadedAt: {
      type: Date,
      required: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
    },
  },
  { timestamps: true }
);

aiDocumentChunkSchema.index({ userId: 1, documentId: 1, chunkIndex: 1 }, { unique: true });
aiDocumentChunkSchema.index({ userId: 1, uploadedAt: -1 });

module.exports = mongoose.model("AiDocumentChunk", aiDocumentChunkSchema);
