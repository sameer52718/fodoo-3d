// src/models/File.js
import mongoose from "mongoose";

const FileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    s3Key: { type: String, required: true },
    isPublic: { type: Boolean, default: false },
    shareLink: { type: String },
    isDeleted: { type: Boolean, default: false },
    thumbnailKey: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.File || mongoose.model("File", FileSchema);
