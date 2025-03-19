"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import WorkExperienceCreation from "@/components/WorkExperience-creation"
import WorkExperienceSection from "@/components/WorkExperience-section"

// Define the WorkExperience type
interface WorkExperience {
  id: number
  title: string
  company: string
  location: string
  period: string
  description: string
  responsibilities: string[]
  technologies: string[]
  companyLogo: string | File | null;
}

export default function WorkExperiencePage() {
  const [isCreationOpen, setIsCreationOpen] = useState(false)
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null) // State for error handling

  // Fetch work experiences on component mount
  useEffect(() => {
    fetchWorkExperiences()
  }, [])

  // Function to fetch work experiences from API
  const fetchWorkExperiences = async () => {
    setIsLoading(true)
    setError(null) // Reset error state before fetching
    try {
      const response = await fetch("/api/work-experience")
      if (!response.ok) {
        throw new Error("Failed to fetch work experiences")
      }
      const data: WorkExperience[] = await response.json()
      setWorkExperiences(data)
    } catch (error) {
      console.error("Error fetching work experiences:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  // Function to handle new work experience creation
  const handleWorkExperienceCreated = (newExperience: WorkExperience) => {
    setWorkExperiences((prevExperiences) => [...prevExperiences, newExperience])
  }

  // Function to handle work experience update
  const handleWorkExperienceUpdated = (updatedExperience: WorkExperience) => {
    setWorkExperiences((prevExperiences) =>
      prevExperiences.map((exp) => (exp.id === updatedExperience.id ? updatedExperience : exp)),
    )
  }

  // Function to handle work experience deletion
  const handleWorkExperienceDeleted = (id: number) => {
    setWorkExperiences((prevExperiences) => prevExperiences.filter((exp) => exp.id !== id))
  }

  return (
    <div className="mx-8 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Work Experience</h1>
        <Button onClick={() => setIsCreationOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Work Experience
        </Button>
      </div>

      <WorkExperienceCreation
        isOpen={isCreationOpen}
        onClose={() => setIsCreationOpen(false)}
        onWorkExperienceCreated={handleWorkExperienceCreated}
      />

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          <p>{error}</p>
        </div>
      ) : (
        <WorkExperienceSection
          workExperiences={workExperiences}
          onWorkExperienceUpdated={handleWorkExperienceUpdated}
          onWorkExperienceDeleted={handleWorkExperienceDeleted}
        />
      )}
    </div>
  )
}