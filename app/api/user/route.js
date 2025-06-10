// src/pages/api/user/index.js
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authMiddleware } from "@/middleware/auth";

// CREATE: Add a new user (admin-only)
export const POST = authMiddleware(async function handler(req) {
  await connectDB();

  const { name, email, password, phone, role } = await req.json();
  if (!name || !email || !password || !phone) {
    return new Response(JSON.stringify({ message: "Name, email, password, and phone are required" }), {
      status: 400,
    });
  }

  const existingUser = await User.findOne({ email, isDeleted: false });
  if (existingUser) {
    return new Response(JSON.stringify({ message: "User already exists" }), {
      status: 400,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    role: role || "USER",
    status: true,
  });
  await user.save();

  return new Response(
    JSON.stringify({ message: "User created", user: { name, email, phone, role: user.role } }),
    {
      status: 201,
    }
  );
}, "ADMIN");

// READ: List all active users with pagination (admin-only)
export const GET = authMiddleware(async function handler(req) {
  await connectDB();

  const { page = 1, limit = 10 } = req.query || {};
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return new Response(JSON.stringify({ message: "Invalid page number" }), {
      status: 400,
    });
  }
  if (isNaN(limitNum) || limitNum < 1) {
    return new Response(JSON.stringify({ message: "Invalid limit value" }), {
      status: 400,
    });
  }

  const skip = (pageNum - 1) * limitNum;
  const total = await User.countDocuments({ isDeleted: false, role: "USER" });
  const users = await User.find({ isDeleted: false, role: "USER" })
    .select("name email phone role status createdAt updatedAt")
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(total / limitNum);

  return new Response(
    JSON.stringify({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
      },
    }),
    {
      status: 200,
    }
  );
}, "ADMIN");

// UPDATE: Modify a user by ID (admin-only)
export const PUT = authMiddleware(async function handler(req) {
  await connectDB();

  const { id } = req.query || {};
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
export const DELETE = authMiddleware(async function handler(req) {
  await connectDB();

  const { id } = req.query || {};
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
