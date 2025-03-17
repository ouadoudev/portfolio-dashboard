import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Certification from "@/lib/models/Certification";


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const certification = await Certification.findOne({ id: Number.parseInt(params.id) });

    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    }

    return NextResponse.json(certification);
  } catch (error) {
    console.error("Error fetching certification:", error);
    return NextResponse.json({ error: "Failed to fetch certification" }, { status: 500 });
  }
}

// PUT (Update) certification by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Parse the request body as JSON
    const body = await request.json();

    const certificationId = Number.parseInt(params.id);
    if (isNaN(certificationId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const existingCertification = await Certification.findOne({ id: certificationId });
    if (!existingCertification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    }

    // Extract fields from the request body
    const { name, provider, details, date, certificateUrl } = body;

    // Validate required fields
    if (!name || !provider || !date || !certificateUrl) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Update the certification
    const updatedCertification = await Certification.findOneAndUpdate(
      { id: certificationId },
      {
        name: name.trim(),
        provider: provider.trim(),
        details: details ? details.trim() : undefined, // Optional field
        date: parsedDate,
        certificateUrl: certificateUrl.trim(),
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json(updatedCertification);
  } catch (error) {
    console.error("Error updating certification:", error);
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

// DELETE certification by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const certification = await Certification.findOne({ id: Number.parseInt(params.id) });

    if (!certification) {
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    }

    // Delete the certification from the database
    await Certification.findOneAndDelete({ id: Number.parseInt(params.id) });

    return NextResponse.json({ message: "Certification deleted successfully" });
  } catch (error) {
    console.error("Error deleting certification:", error);
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}