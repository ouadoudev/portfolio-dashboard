import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/lib/models/User";
import cloudinary from "@/lib/cloudinary";
import fs from "fs";
import path from "path";


// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer();
  const base64String = Buffer.from(buffer).toString("base64");
  const dataUri = `data:${file.type};base64,${base64String}`;

  const uploadResponse = await cloudinary.uploader.upload(dataUri, {
    folder,
  });
  return uploadResponse.secure_url;
};

// GET all users
export async function GET() {
  try {
    await connectToDatabase();
    const users = await User.find({}).sort({ id: 1 });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// POST a new user
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await connectToDatabase();

    // Find the highest ID to auto-increment
    const highestUser = await User.findOne().sort({ id: -1 });
    const newId = highestUser ? highestUser.id + 1 : 1;

    const fullName = formData.get("fullName") as string;
    const title = formData.get("title") as string;
    const tagline = formData.get("tagline") as string;
    const introduction = formData.get("introduction") as string;
    const keySkillsInput = formData.get("keySkills") as string;
    const status = formData.get("status") as string;
    const cvFile = formData.get("cv") as File;

    const keySkills = keySkillsInput.split(",").map((skill) => skill.trim());

    // Upload image
    const imageFile = formData.get("image") as File;
    const imageUrl = imageFile ? await uploadToCloudinary(imageFile, "users/images") : "";

    // Upload CV to the uploads folder
    let cvUrl = "";
    if (cvFile) {
      // Ensure the uploads directory exists
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate a unique filename
      const cvFileName = `cv-${Date.now()}${path.extname(cvFile.name)}`;
      const cvFilePath = path.join(uploadsDir, cvFileName);

      // Convert the file to a buffer and save it
      const buffer = Buffer.from(await cvFile.arrayBuffer());
      fs.writeFileSync(cvFilePath, buffer);

      cvUrl = `/uploads/${cvFileName}`;
    }

    // Save to the database
    const newUser = new User({
      id: newId,
      fullName,
      image: imageUrl,
      title,
      tagline,
      introduction,
      keySkills,
      status,
      cv: cvUrl,
    });

    await newUser.save();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}