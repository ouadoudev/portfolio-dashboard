import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Certification from "@/lib/models/Certification";

export async function GET() {
  try {
    await connectToDatabase();
    const certifications = await Certification.find({}).sort({ id: 1 }).lean();
    return NextResponse.json(certifications);
  } catch (error) {
    console.error("Error fetching work certifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch work certifications" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body as JSON
    const body = await request.json();

    // Auto-increment ID
    const latestCertification = await Certification.findOne().sort({ id: -1 });
    const newId = latestCertification ? latestCertification.id + 1 : 1;

    // Extract and validate required fields
    const { name, provider, date, certificateUrl, details } = body;
    if (!name || !provider || !date || !certificateUrl) {
      return NextResponse.json({ error: "Name, provider, date, and certificateUrl are required" }, { status: 400 });
    }

    // Validate date format
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Save new certification
    const newCertification = await Certification.create({
      id: newId,
      name: name.trim(),
      provider: provider.trim(),
      date: parsedDate,
      certificateUrl: certificateUrl.trim(),
      details: details ? details.trim() : undefined, 
    });

    // Return the newly created certification
    return NextResponse.json(newCertification, { status: 201 });
  } catch (error) {
    console.error("Error creating certification:", error);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}