import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Contact from "@/lib/models/Contact"; // Import the Contact model

// GET: Retrieve the existing contact
export async function GET() {
  try {
    await connectToDatabase();
    const contact = await Contact.findOne(); // Fetch the single contact
    if (!contact) {
      return NextResponse.json({ error: "No contact found." }, { status: 404 });
    }
    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}

// POST: Create a new contact
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Check if a contact already exists
    const existingContact = await Contact.findOne();
    if (existingContact) {
      return NextResponse.json({ error: "A contact already exists. Only one contact can be created." }, { status: 400 });
    }

    // Create a new contact
    const { email, phone, socialLinks } = body;

    // Save to the database
    const newContact = new Contact({
      email,
      phone,
      socialLinks
    });

    await newContact.save();
    return NextResponse.json(newContact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}

// PUT: Update the existing contact
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    // Find the existing contact
    const existingContact = await Contact.findOne();
    if (!existingContact) {
      return NextResponse.json({ error: "No contact found to update." }, { status: 404 });
    }

    // Update the contact with new data
    const updatedContact = await Contact.findByIdAndUpdate(existingContact._id, body, { new: true });
    return NextResponse.json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json({ error: "Failed to update contact" }, { status: 500 });
  }
}

// DELETE: Delete the existing contact
export async function DELETE() {
  try {
    await connectToDatabase();

    // Find the existing contact
    const existingContact = await Contact.findOne();
    if (!existingContact) {
      return NextResponse.json({ error: "No contact found to delete." }, { status: 404 });
    }

    // Delete the contact
    await Contact.deleteOne({ _id: existingContact._id });
    return NextResponse.json({ message: "Contact deleted successfully." });
  } catch (error) {
    console.error("Error deleting contact:", error);
    return NextResponse.json({ error: "Failed to delete contact" }, { status: 500 });
  }
}