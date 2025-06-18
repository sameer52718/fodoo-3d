import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import Category from "@/models/Category";

// GET: List files in a folder
export const GET = authMiddleware(async function handler(req) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return new Response(JSON.stringify({ message: "Folder ID is required" }), { status: 400 });
  }

  const query = { isDeleted: false, folder };
  if (req.user.role === "USER") {
    query.$or = [{ uploadedBy: req.user.userId }, { isPublic: true }, { assignedUsers: req.user.userId }];
  }

  const files = await File.find(query).populate("uploadedBy category", "name");
  return new Response(JSON.stringify({ files }), { status: 200 });
});
