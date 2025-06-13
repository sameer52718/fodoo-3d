import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";

export const POST = authMiddleware(async function handler(req) {
  await connectDB();
  const { folder, link, name, category } = await req.json();

  if (!link || !name || !folder) {
    return new Response(JSON.stringify({ message: "Link, name and folder are required" }), { status: 400 });
  }

  const newFile = new File({
    name: name,
    folder,
    category: category || null,
    uploadedBy: req.user.userId,
    s3Key: link,
  });
  await newFile.save();
  return new Response(JSON.stringify({ message: "File uploaded", file: newFile }), { status: 201 });
});
