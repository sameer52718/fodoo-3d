import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import Category from "@/models/Category";

// CREATE: Add a new category (admin-only)
export const POST = authMiddleware(async function handler(req) {
  await connectDB();

  const { name } = await req.json();
  if (!name) {
    return new Response(JSON.stringify({ message: "Category name is required" }), {
      status: 400,
    });
  }

  const existingCategory = await Category.findOne({ name, isDeleted: false });
  if (existingCategory) {
    return new Response(JSON.stringify({ message: "Category already exists" }), {
      status: 400,
    });
  }

  const category = new Category({
    name,
    createdBy: req.user.userId,
    status: true,
  });
  await category.save();

  return new Response(JSON.stringify({ message: "Category created", category }), {
    status: 201,
  });
}, "ADMIN");

// READ: List all active categories with pagination (admin-only)
export const GET = async function handler(req) {
  await connectDB();

  const { page = 1, limit = 10 } = req.query || {};
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (isNaN(pageNum) || pageNum < 1) {
    return new Response(JSON.stringify({ message: "Invalid page number" }), {
      status: 400,
    });
  }

  const total = await Category.countDocuments({ isDeleted: false });

  let categories;
  let totalPages;

  if (limitNum === -1) {
    // Fetch all categories without pagination
    categories = await Category.find({ isDeleted: false }).populate("createdBy", "name");
    totalPages = 1; // Single "page" containing all items
  } else {
    // Apply pagination
    if (isNaN(limitNum) || limitNum < 1) {
      return new Response(JSON.stringify({ message: "Invalid limit value" }), {
        status: 400,
      });
    }
    const skip = (pageNum - 1) * limitNum;
    categories = await Category.find({ isDeleted: false })
      .populate("createdBy", "name")
      .skip(skip)
      .limit(limitNum);
    totalPages = Math.ceil(total / limitNum);
  }

  return new Response(
    JSON.stringify({
      categories,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum === -1 ? total : limitNum,
      },
    }),
    {
      status: 200,
    }
  );
};