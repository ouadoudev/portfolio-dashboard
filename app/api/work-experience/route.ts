import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import WorkExperience from "@/lib/models/WorkExperience"
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
    await connectToDatabase()
    const experiences = await WorkExperience.find({}).sort({ id: 1 }).lean();
    return NextResponse.json(experiences)
  } catch (error) {
    console.error("Error fetching work experiences:", error)
    return NextResponse.json({ error: "Failed to fetch work experiences" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    await connectToDatabase();
    const latestExperience = await WorkExperience.findOne().sort({ id: -1 });
    const newId = latestExperience ? latestExperience.id + 1 : 1;

    const title = formData.get("title") as string;
    const company = formData.get("company") as string;
    const location = formData.get("location") as string;
    const period = formData.get("period") as string;
    const description = formData.get("description") as string;
    const technologies = formData.getAll("technologies").map((tech) => tech.toString().trim());
    const responsibilities = formData.getAll("responsibilities").map((resp) => resp.toString().trim());
    const imageFile = formData.get("companyLogo") as File;
    const companyLogoUrl = imageFile ? await uploadToCloudinary(imageFile, "company/logos") : "";

    const newExperience = new WorkExperience({
      id: newId,
      title,
      company,
      location,
      period,
      description,
      technologies,
      responsibilities,
      companyLogo: companyLogoUrl,
    });
    await newExperience.save();
    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    console.error("Error creating work experience:", error);
    return NextResponse.json({ error: "Failed to create work experience" }, { status: 500 });
  }
}
