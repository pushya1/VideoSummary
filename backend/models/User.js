const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photo: { type: String },
    files: [
      {
        fileId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "File",
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        }
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
