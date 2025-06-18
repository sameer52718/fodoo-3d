// src/pages/api/auth/login.js
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();

  const { email, password } = await req.json();
  if (!email || !password) {
    return new Response(JSON.stringify({ message: "Email and password are required" }), {
      status: 400,
    });
  }

  const user = await User.findOne({ email, isDeleted: false });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return new Response(JSON.stringify({ message: "Invalid credentials" }), {
      status: 401,
    });
  }

  // if (user.role !== "ADMIN") {
  //   return new Response(JSON.stringify({ message: "Access denied: Admins only" }), {
  //     status: 403,
  //   });
  // }

  const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return new Response(
    JSON.stringify({
      token,
      role: user.role,
      user: { name: user.name, email: user.email, phone: user.phone, _id: user._id },
    }),
    {
      status: 200,
    }
  );
}

// export async function GET(req, res) {
//   await connectDB();

//   const hashedPassoword = await bcrypt.hash("Admin@123", 10);

//   const user = await User.create({
//     name: "Dummy Admin",
//     email: "dummy@gmail.com",
//     password: hashedPassoword,
//     phone: "123456789",
//     role: "ADMIN",
//   });

//   return new Response(JSON.stringify({ success: true, message: "Hello world", user }), {
//     status: 200,
//   });
// }
