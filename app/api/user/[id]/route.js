// src/pages/api/user/index.js
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/middleware/auth";

// UPDATE: Modify a user by ID (admin-only)
export const PUT = authMiddleware(async function handler(req, context) {
  await connectDB();

  const { id } = context.params || {};
  const { name, email, password, phone, role, status } = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ message: "User ID is required" }), {
      status: 400,
    });
  }

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  if (email) {
    const existingUser = await User.findOne({ email, isDeleted: false, _id: { $ne: id } });
    if (existingUser) {
      return new Response(JSON.stringify({ message: "Email already in use" }), {
        status: 400,
      });
    }
    user.email = email;
  }
  if (name) user.name = name;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (phone) user.phone = phone;
  if (role && ["ADMIN", "USER"].includes(role)) user.role = role;
  if (typeof status === "boolean") user.status = status;

  await user.save();
  return new Response(
    JSON.stringify({
      message: "User updated",
      user: { name: user.name, email: user.email, phone: user.phone, role: user.role, status: user.status },
    }),
    {
      status: 200,
    }
  );
}, "ADMIN");

// DELETE: Soft-delete a user by ID (admin-only)
export const DELETE = authMiddleware(async function handler(req, context) {
  await connectDB();

  const { id } = context.params || {};
  if (!id) {
    return new Response(JSON.stringify({ message: "User ID is required" }), {
      status: 400,
    });
  }

  const user = await User.findOne({ _id: id, isDeleted: false });
  if (!user) {
    return new Response(JSON.stringify({ message: "User not found" }), {
      status: 404,
    });
  }

  user.isDeleted = true;
  await user.save();
  return new Response(JSON.stringify({ message: "User deleted" }), {
    status: 200,
  });
}, "ADMIN");
