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

export async function GET() {
  try {
    await connectToDatabase();
    const testimonials = await Testimonial.find({});
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await connectToDatabase();

    // Find the latest testimonial to generate the new ID
    const latestTestimonial = await Testimonial.findOne().sort({ id: -1 });
    const newId = latestTestimonial ? latestTestimonial.id + 1 : 1;

    // Extract fields from form data
    const authorName = formData.get("authorName") as string;
    const authorPosition = formData.get("authorPosition") as string;
    const quote = formData.get("quote") as string;
    const imageFile = formData.get("authorImage") as File | null;

    // Validate required fields
    if (!authorName || !authorPosition || !quote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let authorImageUrl = "";

    // Upload image to Cloudinary if provided
    if (imageFile && imageFile.size > 0) {
      try {
        authorImageUrl = await uploadToCloudinary(imageFile, "testimonial/feedback");
      } catch (uploadError) {
        console.error("Error uploading image to Cloudinary:", uploadError);
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
      }
    }

    // Create a new testimonial
    const newTestimonial = new Testimonial({
      id: newId,
      authorName,
      authorPosition,
      quote,
      authorImage: authorImageUrl,
    });

    // Save the new testimonial to the database
    await newTestimonial.save();

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error("Error creating testimonial:", error);
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 });
  }
}