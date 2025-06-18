import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Folder from "@/models/Folder";

// GET: List folders with optional parent filter
export const GET = authMiddleware(async function handler(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const parent = searchParams.get("parent");

  const query = { isDeleted: false };
  if (req.user.role === "USER") {
    query.assignedUsers = req.user.userId;
  }
  if (parent) query.parent = parent;
  else query.parent = null;
  console.log(query);

  const folders = await Folder.find(query).populate("createdBy", "name");
  return new Response(JSON.stringify({ folders }), { status: 200 });
});

// POST: Create a new folder (admin-only)
export const POST = authMiddleware(async function handler(req) {
  await connectDB();
  if (req.user.role !== "ADMIN") {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  const { name, parent } = await req.json();
  if (!name) {
    return new Response(JSON.stringify({ message: "Folder name is required" }), { status: 400 });
  }


  const existingFolder = await Folder.findOne({ name, parent, isDeleted: false });
  if (existingFolder) {
    return new Response(JSON.stringify({ message: "Folder already exists" }), { status: 400 });
  }

  const parentFolder = parent ? await Folder.findById(parent).lean() : null;
  if (parent && !parentFolder) {
    return new Response(JSON.stringify({ message: "Parent folder not found" }), { status: 404 });
  }

  const folder = new Folder({
    name,
    parent,
    createdBy: req.user.userId,
    assignedUsers: [req.user.userId, ...parentFolder.assignedUsers],
  });
  await folder.save();
  return new Response(JSON.stringify({ message: "Folder created", folder }), { status: 201 });
}, "ADMIN");
