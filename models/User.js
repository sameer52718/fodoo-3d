import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ["ADMIN", "USER"], default: "USER" },
    assignedFolders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    sessionToken: { type: String, default: null },
    sessionExpiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
