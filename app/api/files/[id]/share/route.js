import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import { nanoid } from "nanoid";

export const POST = authMiddleware(async function handler(req, { params }) {
  await connectDB();
  const file = await File.findById(params.id);
  if (!file || file.isDeleted) {
    return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
  }

  if (req.user.role !== "ADMIN" && file.uploadedBy.toString() !== req.user.userId.toString()) {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  if (!file.shareLink) {
    file.shareLink = `${process.env.NEXT_PUBLIC_S3_URL}/share/${nanoid(10)}`;
    await file.save();
  }
  return new Response(JSON.stringify({ message: "Share link generated", shareLink: file.shareLink }), {
    status: 200,
  });
});
