import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import { uploadToS3 } from "@/lib/s3";

export const POST = authMiddleware(async function handler(req) {
  await connectDB();
  const formData = await req.formData();
  const file = formData.get("file");
  const folder = formData.get("folder");
  const category = formData.get("category");

  if (!file || !folder) {
    return new Response(JSON.stringify({ message: "File and folder are required" }), { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const s3Key = `files/${Date.now()}-${file.name}`;
  console.log(buffer, s3Key);

  uploadToS3(buffer, s3Key);

  const newFile = new File({
    name: file.name,
    folder,
    category: category || null,
    uploadedBy: req.user.userId,
    s3Key,
  });
  await newFile.save();
  return new Response(JSON.stringify({ message: "File uploaded", file: newFile }), { status: 201 });
});
