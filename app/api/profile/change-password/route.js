import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// POST: Change user password
export const POST = authMiddleware(async function handler(req) {
    await connectDB();

    try {
        const { password, newPassword } = await req.json();
        const { userId } = req.user;

        // Validate input fields
        if (!password || !newPassword) {
            return new Response(JSON.stringify({ error: true, message: "Both password and newPassword are required" }), { status: 400 });
        }

        // Find the user by ID
        const admin = await User.findOne({ _id: userId, });
        if (!admin) {
            return new Response(JSON.stringify({ error: true, message: "Admin not found" }), { status: 404 });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return new Response(JSON.stringify({ error: true, message: "Current password is invalid" }), { status: 400 });
        }

        // Update password (assuming pre-save hook in User model handles hashing)
        admin.password = newPassword;
        await admin.save();

        // Return success message
        return new Response(JSON.stringify({ error: false, message: "Password changed successfully" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An unexpected error occurred" }), { status: 500 });
    }
});