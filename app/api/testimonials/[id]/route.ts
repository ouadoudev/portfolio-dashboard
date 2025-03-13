import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Testimonial from "@/lib/models/Testimonial";
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

// GET testimonial by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await connectToDatabase();

    // Fetch testimonial by ID
    const testimonial = await Testimonial.findOne({ id: Number(id) });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }
    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error fetching testimonial:", error);
    return NextResponse.json({ error: "Failed to fetch testimonial" }, { status: 500 });
  }
}

// PUT to update a testimonial by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    await connectToDatabase();

    // Find the testimonial by ID
    const testimonial = await Testimonial.findOne({ id: Number(id) });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Store the current authorImage URL for deletion if needed
    const currentAuthorImage = testimonial.authorImage;

    // Update fields
    testimonial.authorName = formData.get("authorName") || testimonial.authorName;
    testimonial.authorPosition = formData.get("authorPosition") || testimonial.authorPosition;
    testimonial.quote = formData.get("quote") || testimonial.quote;

    const imageFile = formData.get("authorImage") as File | null;
    if (imageFile && imageFile.size > 0) {
      // If a new image is uploaded, delete the old one from Cloudinary
      if (currentAuthorImage) {
        const publicId = currentAuthorImage.split('/').pop();
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
      // Upload the new image
      testimonial.authorImage = await uploadToCloudinary(imageFile, "testimonial/feedback");
    }

    // Save the updated testimonial
    await testimonial.save();

    return NextResponse.json(testimonial);
  } catch (error) {
    console.error("Error updating testimonial:", error);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

// DELETE testimonial by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    await connectToDatabase();

    // Find the testimonial by ID
    const testimonial = await Testimonial.findOne({ id: Number(id) });
    if (!testimonial) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    // Delete the image from Cloudinary
    const publicId = testimonial.authorImage.split('/').pop();
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    // Delete testimonial by ID
    await Testimonial.findOneAndDelete({ id: Number(id) });
    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimonial:", error);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}