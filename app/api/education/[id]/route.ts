import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Education from "@/lib/models/Education";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const education = await Education.findOne({ id: Number.parseInt(params.id) });

    if (!education) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    return NextResponse.json(education);
  } catch (error) {
    console.error("Error fetching education:", error);
    return NextResponse.json({ error: "Failed to fetch education" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if education exists
    const existingEducation = await Education.findOne({ id: Number.parseInt(params.id) });
    if (!existingEducation) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    const { degree, institution, location, period, description, courses, options } = body;
    
    // Ensure courses is always an array
    const formattedCourses = Array.isArray(courses) 
      ? courses.map(course => course.trim()) 
      : courses?.split(",").map((course: string) => course.trim()) || [];

    // Update education record
    const updatedEducation = await Education.findOneAndUpdate(
      { id: Number.parseInt(params.id) },
      {
        degree,
        institution,
        description,
        location,
        period,
        courses: formattedCourses,
        options,
      },
      { new: true }
    );

    return NextResponse.json(updatedEducation);
  } catch (error) {
    console.error("Error updating education:", error);
    return NextResponse.json({ error: "Failed to update education" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    // Check if education exists before deleting
    const education = await Education.findOne({ id: Number.parseInt(params.id) });

    if (!education) {
      return NextResponse.json({ error: "Education not found" }, { status: 404 });
    }

    await Education.findOneAndDelete({ id: Number.parseInt(params.id) });

    return NextResponse.json({ message: "Education deleted successfully" });
  } catch (error) {
    console.error("Error deleting education:", error);
    return NextResponse.json({ error: "Failed to delete education" }, { status: 500 });
  }
}
