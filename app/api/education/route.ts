import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/db"
import Education from "@/lib/models/Education"


export async function GET() {
  try {
    await connectToDatabase()
    const educations = await Education.find({}).sort({ id: 1 })
    return NextResponse.json(educations)
  } catch (error) {
    console.error("Error fetching educations:", error)
    return NextResponse.json({ error: "Failed to fetch educations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase()

    const highestEducation = await Education.findOne().sort({ id: -1 })
    const newId = highestEducation ? highestEducation.id + 1 : 1

    const { degree, institution, location, period, description, courses, options } = body;
    const formattedCourses = Array.isArray(courses) ? courses : courses?.split(',').map((course: string) => course.trim());

    // Save to the database
    const newEducation = new Education({
      id: newId,
      degree,
      institution,
      description,
      location,
      period,
      courses:formattedCourses,
      options
    })

    await newEducation.save()
    return NextResponse.json(newEducation, { status: 201 })
  } catch (error) {
    console.error("Error creating education:", error)
    return NextResponse.json({ error: "Failed to create education" }, { status: 500 })
  }
}
