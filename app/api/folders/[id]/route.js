import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Folder from "@/models/Folder";

// DELETE: Soft delete a folder (admin-only)
export const DELETE = authMiddleware(async function handler(req, { params }) {
  await connectDB();
  if (req.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  const folder = await Folder.findById(params.id);
  if (!folder || folder.isDeleted) {
    return new Response(JSON.stringify({ message: "Folder not found" }), { status: 404 });
  }

  folder.isDeleted = true;
  await folder.save();
  return new Response(JSON.stringify({ message: "Folder deleted" }), { status: 200 });
}, "ADMIN");

// PATCH: Assign user to folder (admin-only)
export const PATCH = authMiddleware(async function handler(req, { params }) {
  await connectDB();
  if (req.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  const { userId } = await req.json();
  if (!userId) {
    return new Response(JSON.stringify({ message: "User ID is required" }), { status: 400 });
  }

  const folder = await Folder.findById(params.id);
  if (!folder || folder.isDeleted) {
    return new Response(JSON.stringify({ message: "Folder not found" }), { status: 404 });
  }

  folder.assignedUsers = [...new Set([...folder.assignedUsers, userId])];
  await folder.save();
  return new Response(JSON.stringify({ message: "User assigned", folder }), { status: 200 });
}, "ADMIN");


// PUT: Rename folder by ID (admin-only)
export const PUT = authMiddleware(async function handler(req, { params }) {
  await connectDB();

  const { id } = params;
  const { name } = await req.json();

  if (!name || !name.trim()) {
    return new Response(JSON.stringify({ message: "Folder name is required" }), {
      status: 400,
    });
  }

  const folder = await Folder.findOne({ _id: id, isDeleted: false });
  if (!folder) {
    return new Response(JSON.stringify({ message: "Folder not found" }), {
      status: 404,
    });
  }

  // Check for name conflict within the same parent
  const existing = await Folder.findOne({
    _id: { $ne: id },
    name: name.trim(),
    parent: folder.parent || null,
    isDeleted: false,
  });

  if (existing) {
    return new Response(JSON.stringify({ message: "Folder with same name already exists" }), {
      status: 400,
    });
  }

  folder.name = name.trim();
  await folder.save();

  return new Response(JSON.stringify({ message: "Folder renamed", folder }), {
    status: 200,
  });
}, "ADMIN");
