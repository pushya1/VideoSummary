const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    fileName: { type: String, required: true },
    bucket: {type: String, required: true},
    key: { type: String, required: true },
    transcription: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);
