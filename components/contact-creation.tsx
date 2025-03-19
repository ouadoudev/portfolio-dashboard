// components/ContactCreation.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onContactUpdated: (contact: any) => void; // Adjust type as needed
  existingContact?: any; // Adjust type as needed
}

export default function ContactCreation({ isOpen, onClose, onContactUpdated, existingContact }: ContactCreationProps) {
  const [formState, setFormState] = useState({
    email: "",
    phone: "",
    socialLinks: {
      instagram: "",
      facebook: "",
      twitter: "",
      linkedin: "",
      youtube: "",
      github: "",
    },
  });

  useEffect(() => {
    if (existingContact) {
      setFormState(existingContact);
    }
  }, [existingContact]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id in formState.socialLinks) {
      setFormState((prev) => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [id]: value },
      }));
    } else {
      setFormState((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSubmit = async () => {
    const response = await fetch("/api/contact", {
      method: existingContact ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });

    if (response.ok) {
      const updatedContact = await response.json();
      onContactUpdated(updatedContact);
      onClose();
    } else {
      console.error("Failed to save contact information");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingContact ? "Edit Contact" : "Add Contact"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={formState.email} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={formState.phone} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={formState.socialLinks.instagram} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" value={formState.socialLinks.facebook} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input id="twitter" value={formState.socialLinks.twitter} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" value={formState.socialLinks.linkedin} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" value={formState.socialLinks.youtube} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input id="github" value={formState.socialLinks.github} onChange={handleChange} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>{existingContact ? "Update Contact" : "Add Contact"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}