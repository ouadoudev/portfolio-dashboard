"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";


interface Contact {
  email: string;
  phone: string;
  socialLinks: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    youtube: string;
    github: string;
  };
}

interface ContactSectionProps {
  contact: Contact;
  onContactUpdated: (contact: Contact) => void;
}

export default function ContactSection({ contact, onContactUpdated }: ContactSectionProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <Button onClick={() => setIsEditOpen(true)}><Edit /> Edit</Button>
        </CardHeader>
        <CardContent>
          <p>Email: {contact.email}</p>
          <p>Phone: {contact.phone}</p>
          <p>Instagram: {contact.socialLinks.instagram}</p>
          <p>Facebook: {contact.socialLinks.facebook}</p>
          <p>Twitter: {contact.socialLinks.twitter}</p>
          <p>LinkedIn: {contact.socialLinks.linkedin}</p>
          <p>YouTube: {contact.socialLinks.youtube}</p>
          <p>GitHub: {contact.socialLinks.github}</p>
        </CardContent>
      </Card>

    </div>
  );
}