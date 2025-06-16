import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import { uploadToS3 } from "@/lib/s3";

export const POST = authMiddleware(async function handler(req) {
  await connectDB();
  const formData = await req.formData();
  const link = formData.get("link");
  const name = formData.get("name");
  const folder = formData.get("folder");
  const category = formData.get("category");
  const thumbnail = formData.get("thumbnail"); // Get thumbnail file

  if (!link || !name || !folder || !thumbnail) {
    return new Response(JSON.stringify({ message: "Thumbnail,Link, name, and folder are required" }), { status: 400 });
  }

  let thumbnailKey = null;
  const buffer = Buffer.from(await thumbnail.arrayBuffer());
  console.log(buffer,"buffer");
  
  thumbnailKey = `thumbnails/${Date.now()}-${thumbnail.name}`;
  console.log(thumbnailKey,"thumbnailKey")
  await uploadToS3(buffer, thumbnailKey); // Upload thumbnail to S3

  const newFile = new File({
    name,
    folder,
    category: category || null,
    uploadedBy: req.user.userId,
    s3Key: link, // Store the link as s3Key
    thumbnailKey, // Store the thumbnail S3 key (null if no thumbnail)
  });
  await newFile.save();

  return new Response(JSON.stringify({ message: "File uploaded", file: newFile }), { status: 201 });
});