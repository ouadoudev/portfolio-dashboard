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

// GET a single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ id: Number.parseInt(params.id) });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

// PUT  to update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
      const formData = await request.formData();
      await connectToDatabase();
  
      // Validate the ID
      const userId = Number.parseInt(params.id);
      if (isNaN(userId)) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }
  
      // Find the user
      const user = await User.findOne({ id: userId });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
  
      // Log form data for debugging
      console.log("Form Data:", Array.from(formData.entries()));
  
      // Extract form data
      const fullName = formData.get("fullName") as string;
      const title = formData.get("title") as string;
      const tagline = formData.get("tagline") as string;
      const introduction = formData.get("introduction") as string;
      const keySkillsInput = formData.get("keySkills") as string;
      const status = formData.get("status") as string;
      const cvFile = formData.get("cv") as File;
  
      const keySkills = keySkillsInput.split(",").map((skill) => skill.trim());
  
      // Handle image upload
      const imageFile = formData.get("image") as File;
      let imageUrl = user.image; // Keep the existing image by default
  
      if (imageFile) {
        console.log("New Image File Detected");
  
        // If a new image is uploaded, delete the old image from Cloudinary (if it exists)
        if (user.image) {
          try {
            const publicId = user.image.split("/").pop()?.split(".")[0];
            console.log("Public ID of Old Image:", publicId);
  
            if (publicId) {
              await cloudinary.uploader.destroy(publicId);
              console.log("Old Image Deleted from Cloudinary");
            }
          } catch (error) {
            console.error("Error deleting old image from Cloudinary:", error);
            // Log the error but continue with the update
          }
        }
  
        // Upload the new image to Cloudinary
        imageUrl = await uploadToCloudinary(imageFile, "users/images");
        console.log("New Image URL:", imageUrl);
      } else {
        console.log("No New Image Provided, Keeping Existing Image");
      }
  
      // Handle CV file upload (if needed)
      let cvUrl = user.cv; // Keep the existing CV by default
      if (cvFile) {
        console.log("New CV File Detected");
  
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
  
        // Optionally, delete the old CV file if it exists
        if (user.cv) {
          const oldCvPath = path.join(process.cwd(), user.cv);
          if (fs.existsSync(oldCvPath)) {
            fs.unlinkSync(oldCvPath);
            console.log("Old CV File Deleted");
          }
        }
      } else {
        console.log("No New CV Provided, Keeping Existing CV");
      }
  
      // Update user fields
      user.fullName = fullName;
      user.title = title;
      user.tagline = tagline;
      user.introduction = introduction;
      user.keySkills = keySkills;
      user.status = status;
      user.image = imageUrl;
      user.cv = cvUrl;
  
      // Log the updated user for debugging
      console.log("Updated User:", user);
  
      // Save the updated user
      await user.save();
  
      return NextResponse.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
    }
  }
  
// DELETE a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const user = await User.findOneAndDelete({
      id: Number.parseInt(params.id),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.cv) {
      const cvFilePath = path.join(process.cwd(), user.cv);
      if (fs.existsSync(cvFilePath)) {
        fs.unlinkSync(cvFilePath); // Delete the file
      }
    }
    if (user.image) {
      try {
        // Extract the public ID from the image URL
        const publicId = user.image.split("/").pop()?.split(".")[0];
        if (publicId) {
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
        // You can choose to log the error and continue, or handle it as needed
      }
    }
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
