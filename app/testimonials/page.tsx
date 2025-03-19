"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import TestimonialCreation from "@/components/testimonial-creation";
import TestimonialSection from "@/components/testimonial-section";

interface Testimonial {
  id: number;
  quote: string;
  authorName: string;
  authorPosition: string;
  authorImage: string | File | null;
}

export default function TestimonialsPage() {
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/testimonials");
      if (!response.ok) {
        throw new Error("Failed to fetch testimonials");
      }
      const data: Testimonial[] = await response.json();
      setTestimonials(data);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestimonialCreated = (newTestimonial: Testimonial) => {
    setTestimonials((prevTestimonials) => [...prevTestimonials, newTestimonial]);
  };

  const handleTestimonialUpdated = (updatedTestimonial: Testimonial) => {
    setTestimonials((prevTestimonials) =>
      prevTestimonials.map((test) => (test.id === updatedTestimonial.id ? updatedTestimonial : test))
    );
  };

  const handleTestimonialDeleted = (id: number) => {
    setTestimonials((prevTestimonials) => prevTestimonials.filter((test) => test.id !== id));
  };

  return (
    <div className="mx-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Testimonials</h1>
        <Button onClick={() => setIsCreationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <TestimonialCreation
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        onTestimonialCreated={handleTestimonialCreated}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <TestimonialSection
          testimonials={testimonials}
          onTestimonialUpdated={handleTestimonialUpdated}
          onTestimonialDeleted={handleTestimonialDeleted}
        />
      )}
    </div>
  );
}