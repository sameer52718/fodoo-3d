import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// POST: Change user password
export const POST = authMiddleware(async function handler(req) {
    await connectDB();

    try {
        const { password } = await req.json();
        const { userId } = req.user;

        // Validate if password is provided
        if (!password) {
            return new Response(JSON.stringify({ error: true, message: "Password is required" }), { status: 400 });
        }

        // Find the user by ID
        const admin = await User.findOne({ _id: userId, });
        if (!admin) {
            return new Response(JSON.stringify({ error: true, message: "Admin not found" }), { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        // Update password (assuming pre-save hook in User model handles hashing)
        admin.password = hashedPassword;
        await admin.save();

        // Return success message
        return new Response(JSON.stringify({ error: false, message: "Password changed successfully" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An unexpected error occurred" }), { status: 500 });
    }
});