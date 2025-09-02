import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import User from "@/lib/models/User"
import cloudinary from "@/lib/cloudinary"

// Helper function to upload files to Cloudinary
const uploadToCloudinary = async (file: File, folder: string) => {
  const buffer = await file.arrayBuffer()
  const base64String = Buffer.from(buffer).toString("base64")
  const dataUri = `data:${file.type};base64,${base64String}`

  const uploadResponse = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "auto", // Allows uploading non-image files like PDFs
  })
  return { secure_url: uploadResponse.secure_url, public_id: uploadResponse.public_id }
}

// GET a single user by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await User.findOne({ id: Number.parseInt(id) })

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
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const formData = await request.formData()
    await connectToDatabase()

    // Validate the ID
    const { id } = await params
    const userId = Number.parseInt(id)
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
    const imageFile = formData.get("image") as File

    const keySkills = keySkillsInput
      ?.split(",")
      .map((skill) => skill.trim())
      .filter(Boolean) || []

    // Handle image upload
    let imageUrl = user.image // Keep the existing image by default
    if (imageFile) {
      // If a new image is uploaded, delete the old image from Cloudinary (if it exists)
      if (user.image) {
        try {
          const publicId = user.image.split("/").pop()?.split(".")[0]
          if (publicId) {
            await cloudinary.uploader.destroy(`users/images/${publicId}`)
          }
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error)
        }
      }

      // Upload the new image to Cloudinary
      const imageUpload = await uploadToCloudinary(imageFile, "users/images")
      imageUrl = imageUpload.secure_url
    }

    // Handle CV file upload
    let cvUrl = user.cv // Keep the existing CV by default
    if (cvFile) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ]
      if (!allowedTypes.includes(cvFile.type)) {
        return NextResponse.json(
          { error: "Only PDF, DOC, and DOCX files are allowed for CV!" },
          { status: 400 }
        )
      }

      // If a new CV is uploaded, delete the old CV from Cloudinary (if it exists)
      if (user.cv) {
        try {
          const publicId = user.cv.split("/").pop()?.split(".")[0]
          if (publicId) {
            await cloudinary.uploader.destroy(`users/cvs/${publicId}`, { resource_type: "raw" })
          }
        } catch (error) {
          console.error("Error deleting old CV from Cloudinary:", error)
        }
      }

      // Upload the new CV to Cloudinary
      const cvUpload = await uploadToCloudinary(cvFile, "users/cvs")
      cvUrl = cvUpload.secure_url
    }

    // Update user fields
    user.fullName = fullName || user.fullName
    user.title = title || user.title
    user.tagline = tagline || user.tagline
    user.introduction = introduction || user.introduction
    user.keySkills = keySkills.length ? keySkills : user.keySkills
    user.status = status || user.status
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
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()
    const { id } = await params
    const user = await User.findOneAndDelete({
      id: Number.parseInt(id),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete CV from Cloudinary if it exists
    if (user.cv) {
      try {
        const publicId = user.cv.split("/").pop()?.split(".")[0]
        if (publicId) {
          await cloudinary.uploader.destroy(`users/cvs/${publicId}`, { resource_type: "raw" })
        }
      } catch (error) {
        console.error("Error deleting CV from Cloudinary:", error)
      }
    }

    // Delete image from Cloudinary if it exists
    if (user.image) {
      try {
        const publicId = user.image.split("/").pop()?.split(".")[0]
        if (publicId) {
          await cloudinary.uploader.destroy(`users/images/${publicId}`)
        }
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error)
      }
    }

    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}