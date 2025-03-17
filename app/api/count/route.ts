import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Certification from "@/lib/models/Certification";
import Education from "@/lib/models/Education";
import Project from "@/lib/models/Project";
import Technology from "@/lib/models/Technology";
import Testimonial from "@/lib/models/Testimonial";
import WorkExperience from "@/lib/models/WorkExperience";


export async function GET() {
  try {
    await connectToDatabase();

    // Get counts for each schema
    const certificationCount = await Certification.countDocuments();
    const educationCount = await Education.countDocuments();
    const projectCount = await Project.countDocuments();
    const technologyCount = await Technology.countDocuments();
    const testimonialCount = await Testimonial.countDocuments();
    const workExperienceCount = await WorkExperience.countDocuments();

    // Prepare the response object
    const counts = {
      certifications: certificationCount,
      education: educationCount,
      projects: projectCount,
      technologies: technologyCount,
      testimonials: testimonialCount,
      workExperiences: workExperienceCount,
    };

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Error fetching document counts:", error);
    return NextResponse.json(
      { error: "Failed to fetch document counts" },
      { status: 500 }
    );
  }
}