import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";

export const GET = authMiddleware(async function handler(req, { params }) {
  await connectDB();

  const { id } = params;

  const file = await File.findById(id).where({ isDeleted: false });

  if (!file) {
    return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
  }
  console.log();

  // Check permissions
  if (
    !file.isPublic &&
    req.user.role !== "ADMIN" &&
    file.uploadedBy.toString() !== req.user.userId.toString()
  ) {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  return new Response(JSON.stringify({ file }), { status: 200 });
});
