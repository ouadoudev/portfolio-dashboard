import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Technology from "@/lib/models/Technology";
import cloudinary from "@/lib/cloudinary";

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

// PUT to update a technology
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // Extracting id from params
    const formData = await request.formData();
    await connectToDatabase();

    const technology = await Technology.findOne({ id });
    if (!technology) {
      return NextResponse.json(
        { error: "Technology not found." },
        { status: 404 }
      );
    }

    const category =
      (formData.get("category") as string) || technology.category;
    const name = (formData.get("name") as string) || technology.name;
    const iconFile = formData.get("icon") as File;

    // Check for duplicate name
    const existingTechnology = await Technology.findOne({ name });
    if (existingTechnology && existingTechnology.id !== id) {
      return NextResponse.json(
        { error: "Technology with this name already exists." },
        { status: 400 }
      );
    }

    // Upload new icon if provided
    const iconUrl = iconFile
      ? await uploadToCloudinary(iconFile, "technologies/icons")
      : technology.icon;

    // Update the technology
    technology.category = category;
    technology.name = name;
    technology.icon = iconUrl;

    await technology.save();
    return NextResponse.json(technology, { status: 200 });
  } catch (error) {
    console.error("Error updating technology:", error);
    return NextResponse.json(
      { error: "Failed to update technology" },
      { status: 500 }
    );
  }
}

// DELETE a technology
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; 
    await connectToDatabase();

    const technology = await Technology.findOneAndDelete({ id });
    if (!technology) {
      return NextResponse.json(
        { error: "Technology not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Technology deleted successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting technology:", error);
    return NextResponse.json(
      { error: "Failed to delete technology" },
      { status: 500 }
    );
  }
}
