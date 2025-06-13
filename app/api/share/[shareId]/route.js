import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import { getSignedUrl } from "@/lib/s3";

export const GET = authMiddleware(async function handler(req, { params }) {
  await connectDB();
  const { shareId } = params;

  // Find file by shareLink
  const file = await File.findOne({
    shareLink: `${process.env.NEXT_PUBLIC_URL}/share/${shareId}`,
    isDeleted: false,
  }).populate("uploadedBy", "name");

  if (!file) {
    return new Response(JSON.stringify({ message: "File not found or invalid share link" }), {
      status: 404,
    });
  }

  // Check access permissions
  if (
    !file.isPublic &&
    req.user.role !== "ADMIN" &&
    file.uploadedBy._id.toString() !== req.user.userId.toString()
  ) {
    return new Response(JSON.stringify({ message: "Access denied" }), { status: 403 });
  }

  // Generate pre-signed S3 URL for secure file access (expires in 1 hour)
  const url = await getSignedUrl(file.s3Key);

  return new Response(
    JSON.stringify({
      message: "File retrieved",
      file: {
        _id: file._id,
        name: file.name,
        isPublic: file.isPublic,
        url, // Pre-signed URL for accessing the file
      },
    }),
    { status: 200 }
  );
});
