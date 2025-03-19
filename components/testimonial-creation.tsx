"use client";

import { useState } from "react";
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

interface Testimonial {
    id: number;
    quote: string;
    authorName: string;
    authorPosition: string;
    authorImage: string;
  }
  

interface TestimonialCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onTestimonialCreated: (newTestimonial: Testimonial) => void;
}

const TestimonialCreation: React.FC<TestimonialCreationProps> = ({ isOpen, onClose, onTestimonialCreated }) => {
  const [quote, setQuote] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorPosition, setAuthorPosition] = useState("");
  const [authorImage, setAuthorImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setQuote("");
    setAuthorName("");
    setAuthorPosition("");
    setAuthorImage(null);
  };

  const handleSubmit = async () => {
    if (!quote || !authorName || !authorPosition) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("quote", quote);
    formData.append("authorName", authorName);
    formData.append("authorPosition", authorPosition);
    if (authorImage) {
      formData.append("authorImage", authorImage);
    }

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const createdTestimonial: Testimonial = await response.json();
        onTestimonialCreated(createdTestimonial);
        resetForm();
        onClose();
        toast({
          title: "Success",
          description: "Testimonial added successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create testimonial");
      }
    } catch (error) {
      console.error("Error creating testimonial:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add testimonial",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); } }}>
      <DialogContent className="max-w-2xl lg:py-4">
        <DialogHeader>
          <DialogTitle>Add New Testimonial</DialogTitle>
          <DialogDescription>Fill in the details to add a new testimonial.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 lg-gap-0 lg:py-0">
          <div className="grid gap-2">
            <Label htmlFor="quote">Quote*</Label>
            <Textarea
              id="quote"
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              placeholder="Enter the testimonial quote"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="authorName">Author Name*</Label>
            <Input
              id="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="e.g. John Doe"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="authorPosition">Author Position*</Label>
            <Input
              id="authorPosition"
              value={authorPosition}
              onChange={(e) => setAuthorPosition(e.target.value)}
              placeholder="e.g. CEO, Company"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="authorImage">Author Image</Label>
            <Input
              type="file"
              id="authorImage"
              onChange={(e) => setAuthorImage(e.target.files?.[0] || null)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Testimonial"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialCreation;