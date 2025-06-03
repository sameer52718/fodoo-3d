// src/middleware/auth.js
import jwt from "jsonwebtoken";

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
