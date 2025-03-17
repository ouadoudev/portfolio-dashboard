import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import WorkExperience from "@/lib/models/WorkExperience";
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

// GET work experience by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const experience = await WorkExperience.findOne({ id: Number.parseInt(params.id) });

    if (!experience) {
      return NextResponse.json({ error: "Work experience not found" }, { status: 404 });
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error fetching work experience:", error);
    return NextResponse.json({ error: "Failed to fetch work experience" }, { status: 500 });
  }
}

// PUT (Update) work experience by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    await connectToDatabase();

    // Validate and parse the ID
    const experienceId = Number.parseInt(params.id);
    if (isNaN(experienceId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Check if the work experience exists
    const existingExperience = await WorkExperience.findOne({ id: experienceId });
    if (!existingExperience) {
      return NextResponse.json({ error: "Work experience not found" }, { status: 404 });
    }

    // Extract form data
    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;
    const period = formData.get("period") as string;
    const description = formData.get("description") as string;

    // Use formData.getAll() to retrieve array fields
    const technologies = formData.getAll("technologies").map((tech) => tech.toString().trim());
    const responsibilities = formData.getAll("responsibilities").map((resp) => resp.toString().trim());

    // Handle company logo (upload new or keep existing)
    const imageFile = formData.get("companyLogo") as File;
    let companyLogoUrl = existingExperience.companyLogo;
    if (imageFile && imageFile.size > 0) {
      companyLogoUrl = await uploadToCloudinary(imageFile, "company/logos");
    }

    // Update the work experience
    const updatedExperience = await WorkExperience.findOneAndUpdate(
      { id: experienceId },
      {
        title,
        company,
        location,
        period,
        description,
        technologies,
        responsibilities,
        companyLogo: companyLogoUrl,
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json(updatedExperience);
  } catch (error) {
    console.error("Error updating work experience:", error);
    return NextResponse.json({ error: "Failed to update work experience" }, { status: 500 });
  }
}
// DELETE work experience by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    // Get the existing work experience
    const experience = await WorkExperience.findOne({ id: Number.parseInt(params.id) });

    if (!experience) {
      return NextResponse.json({ error: "Work experience not found" }, { status: 404 });
    }
    if (experience.companyLogo) {
      const publicId = experience.companyLogo.split("/").pop()?.split(".")[0]; // Ensure only the ID is extracted
      if (publicId) {
        await cloudinary.uploader.destroy(`company/logos/${publicId}`);
      }
    } 

    // Delete the work experience from the database
    await WorkExperience.findOneAndDelete({ id: Number.parseInt(params.id) });

    return NextResponse.json({ message: "Work experience deleted successfully" });
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return NextResponse.json({ error: "Failed to delete work experience" }, { status: 500 });
  }
}
