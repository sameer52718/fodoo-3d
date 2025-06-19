import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";

// PUT: Update user profile
export const POST = authMiddleware(async function handler(req) {
    await connectDB();

    try {
        const { userId } = req.user;
        const { name, phone } = await req.json();

        // Validate input fields
        if (!name || !phone) {
            return new Response(JSON.stringify({ error: true, message: "All fields (name, phone) are required" }), { status: 400 });
        }

        // Find the user by ID
        const admin = await User.findOne({ _id: userId });
        if (!admin) {
            return new Response(JSON.stringify({ error: true, message: "Admin not found" }), { status: 404 });
        }

        // Update admin details
        admin.name = name;
        admin.phone = phone;
        await admin.save();

        // Respond with success
        return new Response(JSON.stringify({ error: false, message: "Profile saved successfully" }), { status: 200 });
    } catch (error) {
        return new Response(JSON.stringify({ error: true, message: error.message || "An unexpected error occurred" }), { status: 500 });
    }
});