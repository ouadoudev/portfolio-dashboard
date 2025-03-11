import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/User"
import cloudinary from "@/lib/cloudinary"
import fs from "fs"
import path from "path"

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

// Helper function to save CV file
const saveCvFile = async (file: File) => {
  // Ensure the uploads directory exists
  const uploadsDir = path.join(process.cwd(), "public", "uploads")
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  // Generate a unique filename
  const cvFileName = `cv-${Date.now()}${path.extname(file.name)}`
  const cvFilePath = path.join(uploadsDir, cvFileName)

  // Convert the file to a buffer and save it
  const buffer = Buffer.from(await file.arrayBuffer())
  fs.writeFileSync(cvFilePath, buffer)

  // Return the public URL path
  return `/uploads/${cvFileName}`
}

// GET a single user by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ id: Number.parseInt(params.id) })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT (or PATCH) to update a user
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData()
    await connectToDatabase()

    // Validate the ID
    const userId = Number.parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 })
    }

    // Find the user
    const user = await User.findOne({ id: userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Extract form data
    const fullName = formData.get("fullName") as string
    const title = formData.get("title") as string
    const tagline = formData.get("tagline") as string
    const introduction = formData.get("introduction") as string
    const keySkillsInput = formData.get("keySkills") as string
    const status = formData.get("status") as string
    const yearsOfExperience = Number.parseInt(formData.get("yearsOfExperience") as string) || user.yearsOfExperience
    const cvFile = formData.get("cv") as File

    const keySkills = keySkillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    // Handle image upload
    const imageFile = formData.get("image") as File
    let imageUrl = user.image // Keep the existing image by default

    if (imageFile) {
      // If a new image is uploaded, delete the old image from Cloudinary (if it exists)
      if (user.image) {
        try {
          // Extract the public ID from the Cloudinary URL
          const publicId = user.image.split("/").pop()?.split(".")[0]
          if (publicId) {
            await cloudinary.uploader.destroy(`users/images/${publicId}`)
          }
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error)
          // Log the error but continue with the update
        }
      }

      // Upload the new image to Cloudinary
      imageUrl = await uploadToCloudinary(imageFile, "users/images")
    }

    // Handle CV file upload
    let cvUrl = user.cv // Keep the existing CV by default
    if (cvFile) {
      // Delete the old CV file if it exists
      if (user.cv) {
        const oldCvPath = path.join(process.cwd(), "public", user.cv)
        if (fs.existsSync(oldCvPath)) {
          fs.unlinkSync(oldCvPath)
        }
      }

      // Save the new CV file
      cvUrl = await saveCvFile(cvFile)
    }

    // Update user fields
    user.fullName = fullName
    user.title = title
    user.tagline = tagline
    user.introduction = introduction
    user.keySkills = keySkills
    user.status = status
    user.yearsOfExperience = yearsOfExperience
    user.image = imageUrl
    user.cv = cvUrl

    // Save the updated user
    await user.save()

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE a user
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()
    const user = await User.findOneAndDelete({
      id: Number.parseInt(params.id),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete CV file if it exists
    if (user.cv) {
      const cvFilePath = path.join(process.cwd(), "public", user.cv)
      if (fs.existsSync(cvFilePath)) {
        fs.unlinkSync(cvFilePath) // Delete the file
      }
    }

    // Delete image from Cloudinary if it exists
    if (user.image) {
      try {
        // Extract the public ID from the image URL
        const publicId = user.image.split("/").pop()?.split(".")[0]
        if (publicId) {
          // Delete the image from Cloudinary
          await cloudinary.uploader.destroy(`users/images/${publicId}`)
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error)
        // Log the error but continue
      }
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

