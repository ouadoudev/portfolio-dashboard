"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Education {
  id: number
  degree: string
  institution: string
  location: string
  period: string
  description: string
  options: string
  courses: string[]
}

interface EducationCreationProps {
  isOpen: boolean
  onClose: () => void
  onEducationCreated: (newEducation: Education) => void
}

const EducationCreation: React.FC<EducationCreationProps> = ({ isOpen, onClose, onEducationCreated }) => {
  const [degree, setDegree] = useState("")
  const [institution, setInstitution] = useState("")
  const [location, setLocation] = useState("")
  const [period, setPeriod] = useState("")
  const [description, setDescription] = useState("")
  const [options, setOptions] = useState("")
  const [courses, setCourses] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setDegree("")
    setInstitution("")
    setLocation("")
    setPeriod("")
    setDescription("")
    setOptions("")
    setCourses("")
  }

  const handleSubmit = async () => {
    if (!degree || !institution) {
      toast({
        title: "Missing fields",
        description: "Please fill in at least the degree and institution fields.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    const newEducation = {
      degree,
      institution,
      location,
      period,
      description,
      options,
      courses: courses.split("\n").filter((course) => course.trim() !== ""),
    }

    try {
      const response = await fetch("/api/education", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newEducation),
      })

      if (response.ok) {
        const createdEducation = await response.json()
        onEducationCreated(createdEducation)
        resetForm()
        onClose()
        toast({
          title: "Success",
          description: "Education entry added successfully",
        })
      } else {
        const error = await response.json()
        throw new Error(error.message || "Failed to create education")
      }
    } catch (error) {
      console.error("Error creating education:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add education entry",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-3xl lg:py-3">
        <DialogHeader>
          <DialogTitle>Add New Education</DialogTitle>
          <DialogDescription>Fill in the details to add a new education entry to your portfolio.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-4 lg-gap-0 lg:py-0">
          <div className="grid gap-2">
            <Label htmlFor="degree">Degree/Certificate*</Label>
            <Input
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              placeholder="e.g. Master of Science in Computer Science"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="institution">Institution*</Label>
              <Input
                id="institution"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Stanford University"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Stanford, CA"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. 2015 - 2017"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="options">Options (GPA, Honors, etc.)</Label>
              <Input
                id="options"
                value={options}
                onChange={(e) => setOptions(e.target.value)}
                placeholder="e.g. GPA: 3.9/4.0"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your education"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="courses">Key Courses (one per line)</Label>
            <Textarea
              id="courses"
              value={courses}
              onChange={(e) => setCourses(e.target.value)}
              rows={4}
              placeholder="List key courses, one per line"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                Adding...
              </>
            ) : (
              "Add Education"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EducationCreation

