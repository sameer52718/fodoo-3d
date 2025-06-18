import { authMiddleware } from "@/middleware/auth";
import connectDB from "@/lib/db";
import File from "@/models/File";
import Folder from "@/models/Folder";
import { uploadToS3 } from "@/lib/s3";
import puppeteer from 'puppeteer';

// Function to validate Kuula URL
const isValidKuulaLink = (link) => {
  const kuulaRegex = /^https:\/\/kuula\.co\/share\/[a-zA-Z0-9]+/;
  return kuulaRegex.test(link);
};


async function getKuulaThumbnail(link) {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1200 });
    await page.goto(link, { waitUntil: 'networkidle2' }); // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 7000));
    const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
    await browser.close();
    console.log("Thumbnail buffer length:", buffer.length);
    return buffer;
  } catch (error) {
    console.error("Error fetching Kuula thumbnail:", error);
    return null; // Return null if screenshot fails
  }
}

export const POST = authMiddleware(async function handler(req) {
  try {
    await connectDB();
    const formData = await req.formData();
    const link = formData.get("link");
    const name = formData.get("name");
    const folder = formData.get("folder");
    const category = formData.get("category");
    const thumbnail = formData.get("thumbnail"); // Optional thumbnail file

    // Validate required fields (thumbnail is optional)
    if (!link || !name || !folder) {
      return new Response(JSON.stringify({ message: "Link, name, and folder are required" }), { status: 400 });
    }

    // Validate Kuula link
    if (!isValidKuulaLink(link)) {
      return new Response(JSON.stringify({ message: "Invalid Kuula link" }), { status: 400 });
    }

    let thumbnailKey = null;

    // If thumbnail is provided, upload it to S3
    if (thumbnail) {
      const buffer = Buffer.from(await thumbnail.arrayBuffer());
      console.log(buffer, "buffer");
      thumbnailKey = `thumbnails/${Date.now()}-${thumbnail.name}`;
      console.log(thumbnailKey, "thumbnailKey");
      await uploadToS3(buffer, thumbnailKey); // Upload thumbnail to S3
    } else {
      // If no thumbnail, generate one from the Kuula link
      const thumbnailBuffer = await getKuulaThumbnail(link);
      if (thumbnailBuffer) {
        thumbnailKey = `thumbnails/${Date.now()}-kuula-thumbnail.jpg`;
        await uploadToS3(thumbnailBuffer, thumbnailKey); // Upload generated thumbnail to S3
      }
    }

    const folderExists = await Folder.findById(folder).lean();
    if (!folderExists) {
      return new Response(JSON.stringify({ message: "Folder not found" }), { status: 404 });
    }


    // Create new file entry
    const newFile = new File({
      name,
      folder,
      category: category || null,
      uploadedBy: req.user.userId,
      s3Key: link, // Store the Kuula link as s3Key
      thumbnailKey, // Store the thumbnail S3 key (null if no thumbnail)
      assignedUsers: [req.user.userId, ...folderExists.assignedUsers],
    });
    await newFile.save();

    return new Response(JSON.stringify({ message: "File uploaded", file: newFile }), { status: 201 });
  } catch (error) {
    console.error("Error in file upload:", error);
    return new Response(JSON.stringify({ message: "Internal server error" }), { status: 500 });
  }
});