import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Technology from "@/lib/models/Technology" // Import the Technology model
import cloudinary from "@/lib/cloudinary"

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer()
  const base64String = Buffer.from(buffer).toString("base64")
  const dataUri = `data:${file.type};base64,${base64String}`

  const uploadResponse = await cloudinary.uploader.upload(dataUri, {
    folder,
  })
  return uploadResponse.secure_url
}

export async function GET() {
  try {
    await connectToDatabase()
    const technologies = await Technology.find({}).sort({ id: 1 })
    return NextResponse.json(technologies)
  } catch (error) {
    console.error("Error fetching technologies:", error)
    return NextResponse.json({ error: "Failed to fetch technologies" }, { status: 500 })
  }
}

export async function POST(request: Request) {
    try {
      const formData = await request.formData();
      await connectToDatabase();
  
      const highestTechnology = await Technology.findOne().sort({ id: -1 });
      const newId = highestTechnology ? highestTechnology.id + 1 : 1;
  
      const category = formData.get("category") as string;
      const name = formData.get("name") as string;
      const iconFile = formData.get("icon") as File;
  
      const validCategories = [
        "Frontend",
        "Backend",
        "Mobile Development",
        "AI & Machine Learning",
        "Data Science",
        "DevOps",
        "Database",
        "IoT",
        "UI/UX Design",
        "Scientific Computing",
        "Programming Languages",
      ];
  
      if (!validCategories.includes(category)) {
        return NextResponse.json({ error: "Invalid category." }, { status: 400 });
      }
  
      // Check for existing technology by name
      const existingTechnology = await Technology.findOne({ name });
      if (existingTechnology) {
        return NextResponse.json({ error: "Technology already exists." }, { status: 400 });
      }
  
      // Upload icon
      const iconUrl = iconFile ? await uploadToCloudinary(iconFile, "technologies/icons") : "";
  
      // Save to the database
      const newTechnology = new Technology({
        id: newId,
        category,
        name,
        icon: iconUrl,
      });
  
      await newTechnology.save();
      return NextResponse.json(newTechnology, { status: 201 });
    } catch (error) {
      console.error("Error creating technology:", error);
      return NextResponse.json({ error: "Failed to create technology" }, { status: 500 });
    }
  }