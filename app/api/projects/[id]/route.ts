import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Project from "@/lib/models/Project";
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const project = await Project.findOne({ id: Number.parseInt(params.id) });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    await connectToDatabase();

    // Fetch the existing project
    const existingProject = await Project.findOne({ id: Number.parseInt(params.id) });
    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Extract text fields
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const liveUrl = formData.get("liveUrl") as string;
    const domain = formData.get("domain") as string;
    const githubUrl = formData.get("githubUrl") as string;

    // Handle thumbnail update
    const thumbnailFile = formData.get("thumbnail") as File;
    const thumbnailUrl = thumbnailFile
      ? await uploadToCloudinary(thumbnailFile, "projects/thumbnails")
      : existingProject.thumbnail; 

    // Handle images update
    const imageFiles = formData.getAll("images") as File[];
    const newImageUrls = await Promise.all(
      imageFiles.map((file) => uploadToCloudinary(file, "projects/images"))
    );
    const images = [...existingProject.images, ...newImageUrls]; // Append new images to existing ones

    // Handle iconLists update
    const iconFiles = formData.getAll("iconLists") as File[];
    const newIconUrls = await Promise.all(
      iconFiles.map((file) => uploadToCloudinary(file, "projects/icons"))
    );
    const iconLists = [...existingProject.iconLists, ...newIconUrls]; // Append new icons to existing ones

    // Handle removed images
    const removedImages = formData.getAll("removedImages") as string[];
    const updatedImages = images.filter((img) => !removedImages.includes(img));

    // Delete removed images from Cloudinary
    await Promise.all(
      removedImages.map(async (img: string) => { // Explicitly type img
        if (img) { // Check if img is defined
          const publicId = img.split('/').pop()?.split('.')[0]; // Extract public ID from URL
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      })
    );

    // Handle removed icons
    const removedIcons = formData.getAll("removedIconLists") as string[];
    const updatedIconLists = iconLists.filter((icon) => !removedIcons.includes(icon));

    // Delete removed icons from Cloudinary
    await Promise.all(
      removedIcons.map(async (icon: string) => { // Explicitly type icon
        if (icon) { // Check if icon is defined
          const publicId = icon.split('/').pop()?.split('.')[0]; // Extract public ID from URL
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      })
    );

    // Update the project
    const updatedProject = await Project.findOneAndUpdate(
      { id: Number.parseInt(params.id) },
      {
        title,
        description,
        domain,
        thumbnail: thumbnailUrl,
        images: updatedImages,
        iconLists: updatedIconLists,
        liveUrl,
        githubUrl,
      },
      { new: true }
    );

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    // Fetch the project based on its ID
    const project = await Project.findOne({ id: Number.parseInt(params.id) });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete images from Cloudinary
    await Promise.all(
      project.images.map(async (img: string) => { // Explicitly type img
        if (img) { // Check if img is defined
          const publicId = img.split('/').pop()?.split('.')[0]; // Extract public ID from URL
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      })
    );

    // Delete icons from Cloudinary
    await Promise.all(
      project.iconLists.map(async (icon: string) => { // Explicitly type icon
        if (icon) { // Check if icon is defined
          const publicId = icon.split('/').pop()?.split('.')[0]; // Extract public ID from URL
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      })
    );

    // Delete the project from the database
    const deletedProject = await Project.findOneAndDelete({ id: Number.parseInt(params.id) });

    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}