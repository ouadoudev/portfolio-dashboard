// components/CertificationCreation.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Certification {
  id: number;
  name: string;
  provider: string;
  details: string;
  date: Date;
  certificateUrl: string;
}

interface CertificationCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onCertificationCreated: (newCertification: Certification) => void;
}

const CertificationCreation: React.FC<CertificationCreationProps> = ({
  isOpen,
  onClose,
  onCertificationCreated,
}) => {
  const [name, setName] = useState("");
  const [provider, setProvider] = useState("");
  const [details, setDetails] = useState("");
  const [date, setDate] = useState("");
  const [certificateUrl, setCertificateUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setProvider("");
    setDetails("");
    setDate("");
    setCertificateUrl("");
  };

  const handleSubmit = async () => {
    if (!name || !provider || !date || !certificateUrl) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const newCertification = {
      name,
      provider,
      details,
      date,
      certificateUrl,
    };

    try {
      const response = await fetch("/api/certifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCertification),
      });

      if (response.ok) {
        const createdCertification: Certification = await response.json();
        onCertificationCreated(createdCertification);
        resetForm();
        onClose();
        toast({
          title: "Success",
          description: "Certification added successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create certification");
      }
    } catch (error) {
      console.error("Error creating certification:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add certification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl lg:py-3">
        <DialogHeader>
          <DialogTitle>Add New Certification</DialogTitle>
          <DialogDescription>Fill in the details to add a new certification.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Certification Name*</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Certified JavaScript Developer"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider*</Label>
            <Input
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              placeholder="e.g. XYZ Institute"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="details">Details</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Additional details about the certification"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Date*</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="certificateUrl">Certificate URL*</Label>
            <Input
              id="certificateUrl"
              value={certificateUrl}
              onChange={(e) => setCertificateUrl(e.target.value)}
              placeholder="e.g. https://example.com/certificates/certified-javascript-developer"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Certification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CertificationCreation;