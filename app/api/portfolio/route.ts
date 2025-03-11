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

// GET all users
export async function GET() {
  try {
    await connectToDatabase()
    const users = await User.find({}).sort({ id: 1 })
    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

// POST a new user - modified to only allow one user
export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    await connectToDatabase()

    // Check if a user already exists
    const existingUsers = await User.find({})
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "A user profile already exists. Only one profile is allowed." },
        { status: 400 },
      )
    }

    // Find the highest ID to auto-increment (should be 1 for the first user)
    const newId = 1

    const fullName = formData.get("fullName") as string
    const title = formData.get("title") as string
    const tagline = formData.get("tagline") as string
    const introduction = formData.get("introduction") as string
    const keySkillsInput = formData.get("keySkills") as string
    const status = formData.get("status") as string
    const yearsOfExperience = Number.parseInt(formData.get("yearsOfExperience") as string) || 0
    const cvFile = formData.get("cv") as File

    const keySkills = keySkillsInput
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    // Upload image
    const imageFile = formData.get("image") as File
    const imageUrl = imageFile ? await uploadToCloudinary(imageFile, "users/images") : ""

    // Upload CV and save the file path for download
    let cvUrl = ""
    if (cvFile) {
      cvUrl = await saveCvFile(cvFile)
    }

    // Save to the database
    const newUser = new User({
      id: newId,
      fullName,
      image: imageUrl,
      title,
      tagline,
      introduction,
      keySkills,
      status,
      cv: cvUrl,
      yearsOfExperience,
    })

    await newUser.save()
    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

