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




export const PATCH = authMiddleware(async function handler(req, { params, user }) {
  await connectDB();

  const { id } = params;
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return new Response(JSON.stringify({ message: "File name is required" }), { status: 400 });
  }

  const file = await File.findOne({ _id: id, isDeleted: false });
  if (!file) {
    return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
  }

  file.name = name.trim();
  await file.save();

  return new Response(JSON.stringify({ message: "File renamed successfully", file }), {
    status: 200,
  });
});
