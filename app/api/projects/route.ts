import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Project from "@/lib/models/Project"

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