import connectDB from "@/lib/db";
import User from "@/models/User";
import Folder from "@/models/Folder";
import File from "@/models/File";
import Category from "@/models/Category";
import { authMiddleware } from "@/middleware/auth";


export const GET = authMiddleware(async function handler(req) {
    try {
        await connectDB();

        // Middleware attaches req.user (from authMiddleware)
        const user = req.user;


        let stats = {};

        if (user.role === "ADMIN") {
            // ADMIN stats: Platform-wide metrics
            const [
                totalUsers,
                activeUsers,
                totalFolders,
                totalFiles,
                publicFiles,
                totalCategories,
            ] = await Promise.all([
                User.countDocuments({ isDeleted: false }),
                User.countDocuments({ status: true, isDeleted: false }),
                Folder.countDocuments({ isDeleted: false }),
                File.countDocuments({ isDeleted: false }),
                File.countDocuments({ isPublic: true, isDeleted: false }),
                Category.countDocuments({ isDeleted: false }),
            ]);

            stats = {
                totalUsers,
                activeUsers,
                totalFolders,
                totalFiles,
                publicFiles,
                privateFiles: totalFiles - publicFiles,
                totalCategories,
            };
        } else {
            // USER stats: User-specific metrics
            const userId = user.userId;

            const [
                assignedFolders,
                assignedFiles,
            ] = await Promise.all([
                Folder.countDocuments({ assignedUsers: userId, isDeleted: false }),
                File.countDocuments({ assignedUsers: userId, isDeleted: false }),
            ]);

            stats = {
                assignedFolders,
                assignedFiles,
            };
        }
        return new Response(JSON.stringify({ error: false, message: "Stats retrieved successfully", stats }), { status: 200 });
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return new Response(JSON.stringify({ error: true, message: "An unexpected error occurred" }), { status: 500 })
        
    }
})
