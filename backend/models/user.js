const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true, // prevent duplicate users
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },
    googleTokens: {
      access_token: String,
      refresh_token: String,
      scope: String,
      token_type: String,
      expiry_date: Number,
    },
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model("User", UserSchema);
