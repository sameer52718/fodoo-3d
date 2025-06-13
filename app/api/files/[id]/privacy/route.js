import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";

export const PATCH = authMiddleware(async function handler(req, { params }) {
  await connectDB();
  const { isPublic } = await req.json();

  const file = await File.findById(params.id);
  if (!file || file.isDeleted) {
    return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
  }

  if (req.user.role !== "ADMIN" && file.uploadedBy.toString() !== req.user.userId.toString()) {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  file.isPublic = isPublic;
  await file.save();
  return new Response(JSON.stringify({ message: "File privacy updated", file }), { status: 200 });
});
