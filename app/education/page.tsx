"use client";

import { useState, useEffect } from "react";
import EducationCreation from "@/components/education-creation";
import EducationSection from "@/components/education-section";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Define the Education type
interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  options: string;
  courses: string[];
}

export default function EducationPage() {
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch educations on component mount
  useEffect(() => {
    fetchEducations();
  }, []);

  // Function to fetch educations from API
  const fetchEducations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/education");
      if (!response.ok) {
        throw new Error("Failed to fetch educations");
      }
      const data: Education[] = await response.json();
      setEducations(data);
    } catch (error) {
      console.error("Error fetching educations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle new education creation
  const handleEducationCreated = (newEducation: Education) => {
    setEducations((prevEducations) => [...prevEducations, newEducation]);
  };

  // Function to handle education update
  const handleEducationUpdated = (updatedEducation: Education) => {
    setEducations((prevEducations) =>
      prevEducations.map((edu) =>
        edu.id === updatedEducation.id ? updatedEducation : edu
      )
    );
  };

  // Function to handle education deletion
  const handleEducationDeleted = (id: number) => {
    setEducations((prevEducations) =>
      prevEducations.filter((edu) => edu.id !== id)
    );
  };

  return (
    <div className="mx-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Education</h1>
        <Button
          onClick={() => setIsCreationOpen(true)}
          className="min-w-[140px]"
          size="sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Education
        </Button>
      </div>

      <EducationCreation
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        onEducationCreated={handleEducationCreated}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <EducationSection
          educations={educations || []}
          onEducationUpdated={handleEducationUpdated}
          onEducationDeleted={handleEducationDeleted}
        />
      )}
    </div>
  );
}
