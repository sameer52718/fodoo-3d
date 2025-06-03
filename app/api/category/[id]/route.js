import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";
// UPDATE: Modify a category by ID (admin-only)
export const PUT = authMiddleware(async function handler(req, context) {
  await connectDB();

  const { id } = context.params || {};
  const { name, status } = await req.json();

  if (!id) {
    return new Response(JSON.stringify({ message: "Category ID is required" }), {
      status: 400,
    });
  }

  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) {
    return new Response(JSON.stringify({ message: "Category not found" }), {
      status: 404,
    });
  }

  if (name) {
    const existingCategory = await Category.findOne({ name, isDeleted: false, _id: { $ne: id } });
    if (existingCategory) {
      return new Response(JSON.stringify({ message: "Category name already exists" }), {
        status: 400,
      });
    }
    category.name = name;
  }
  if (typeof status === "boolean") category.status = status;

  await category.save();
  return new Response(JSON.stringify({ message: "Category updated", category }), {
    status: 200,
  });
}, "ADMIN");

// DELETE: Soft-delete a category by ID (admin-only)
export const DELETE = authMiddleware(async function handler(req, context) {
  await connectDB();

  const { id } = context.params || {};

  if (!id) {
    return new Response(JSON.stringify({ message: "Category ID is required" }), {
      status: 400,
    });
  }

  const category = await Category.findOne({ _id: id, isDeleted: false });
  if (!category) {
    return new Response(JSON.stringify({ message: "Category not found" }), {
      status: 404,
    });
  }

  category.isDeleted = true;
  await category.save();
  return new Response(JSON.stringify({ message: "Category deleted" }), {
    status: 200,
  });
}, "ADMIN");
