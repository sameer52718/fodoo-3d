import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import Folder from "@/models/Folder";

export const PATCH = authMiddleware(async function handler(req, { params }) {
    await connectDB();
    const { id } = params || {};
    const { folderId } = await req.json();

    if (!id || !folderId) {
        return new Response(JSON.stringify({ message: "File ID and target folder ID are required" }), {
            status: 400,
        });
    }

    try {
        const file = await File.findOne({ _id: id, isDeleted: false });
        if (!file) {
            return new Response(JSON.stringify({ message: "File not found" }), { status: 404 });
        }

        // Check permissions: only admin or uploader can move the file
        if (req.user.role !== "ADMIN" && file.uploadedBy.toString() !== req.user.userId) {
            return new Response(JSON.stringify({ message: "Unauthorized to move this file" }), {
                status: 403,
            });
        }

        const targetFolder = await Folder.findOne({ _id: folderId, isDeleted: false });
        if (!targetFolder) {
            return new Response(JSON.stringify({ message: "Target folder not found" }), { status: 404 });
        }

        file.folder = folderId;
        await file.save();

        return new Response(JSON.stringify({ message: "File moved successfully", file }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ message: "Failed to move file" }), { status: 500 });
    }
});