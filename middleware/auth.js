// src/middleware/auth.js
import jwt from "jsonwebtoken";
import User from "@/models/User";
import Folder from "@/models/Folder";
import File from "@/models/File";
import connectDB from "@/lib/db";

export const authMiddleware = (handler, requiredRole = null) => {
  return async (req, res) => {
    try {
      const token = req.headers.get("Authorization");

      if (!token) {
        return new Response(JSON.stringify({ message: "No token provided" }), {
          status: 401,
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      // Connect to database
      await connectDB();

      // Validate session token against database
      const user = await User.findById(decoded.userId).select("sessionToken sessionExpiresAt role email");
      if (!user || user.sessionToken !== token || (user.sessionExpiresAt && user.sessionExpiresAt < new Date())) {
        return NextResponse.json({ error: true, message: "Invalid or expired session" }, { status: 401 });
      }


      req.user = decoded;
      if (requiredRole && decoded.role !== requiredRole) {
        return new Response(JSON.stringify({ message: "Access denied" }), {
          status: 403,
        });
      }
      return await handler(req, res);
    } catch (error) {
      console.error("Middle Ware Error", error);
      return new Response(JSON.stringify({ message: "Invalid token" }), {
        status: 401,
      });
    }
  };
};
