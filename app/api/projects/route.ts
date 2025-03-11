import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Project from "@/lib/models/Project"
import cloudinary from "@/lib/cloudinary"

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

export async function GET() {
  try {
    await connectToDatabase()
    const projects = await Project.find({}).sort({ id: 1 })
    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    await connectToDatabase()

    // Find the highest ID to auto-increment
    const highestProject = await Project.findOne().sort({ id: -1 })
    const newId = highestProject ? highestProject.id + 1 : 1

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const liveUrl = formData.get("liveUrl") as string
    const  githubUrl = formData.get("githubUrl") as string
    const domain = formData.get("domain") as string; 

    // Upload thumbnail
    const thumbnailFile = formData.get("thumbnail") as File
    const thumbnailUrl = thumbnailFile ? await uploadToCloudinary(thumbnailFile, "projects/thumbnails") : ""

    // Upload images
    const images: string[] = []
    const imageFiles = formData.getAll("images") as File[]
    for (const file of imageFiles) {
      const imageUrl = await uploadToCloudinary(file, "projects/images")
      images.push(imageUrl)
    }

    // Upload icon lists
    const iconLists: string[] = []
    const iconFiles = formData.getAll("iconLists") as File[]
    for (const file of iconFiles) {
      const iconUrl = await uploadToCloudinary(file, "projects/icons")
      iconLists.push(iconUrl)
    }

    // Save to the database
    const newProject = new Project({
      id: newId,
      title,
      description,
      domain,
      thumbnail: thumbnailUrl,
      images,
      iconLists,
      liveUrl,
      githubUrl
    })

    await newProject.save()
    return NextResponse.json(newProject, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
