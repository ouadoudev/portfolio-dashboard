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

interface WorkExperience {
  id: number
  title: string
  company: string
  location: string
  period: string
  description: string
  responsibilities: string[]
  technologies: string[]
  companyLogo: File | null;
}

interface WorkExperienceCreationProps {
  isOpen: boolean
  onClose: () => void
  onWorkExperienceCreated: (newExperience: WorkExperience) => void
}

const WorkExperienceCreation: React.FC<WorkExperienceCreationProps> = ({ isOpen, onClose, onWorkExperienceCreated }) => {
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [location, setLocation] = useState("")
  const [period, setPeriod] = useState("")
  const [description, setDescription] = useState("")
  const [responsibilities, setResponsibilities] = useState("")
  const [technologies, setTechnologies] = useState("")
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setTitle("")
    setCompany("")
    setLocation("")
    setPeriod("")
    setDescription("")
    setResponsibilities("")
    setTechnologies("")
    setCompanyLogo(null)
  }

  const handleSubmit = async () => {
    if (!title || !company) {
      toast({
        title: "Missing fields",
        description: "Please fill in at least the title and company fields.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSubmitting(true);
  
    const newExperience = {
      title,
      company,
      location,
      period,
      description,
      responsibilities: responsibilities.split("\n").filter((resp) => resp.trim() !== ""),
      technologies: technologies.split(",").map((tech) => tech.trim()),
    };
  
    const formData = new FormData();
    Object.entries(newExperience).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    });
  
    // Only append companyLogo if it is not null
    if (companyLogo) {
      formData.append("companyLogo", companyLogo);
    }
  
    try {
      const response = await fetch("/api/work-experience", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const createdExperience = await response.json();
        onWorkExperienceCreated(createdExperience);
        resetForm();
        onClose();
        toast({
          title: "Success",
          description: "Work experience entry added successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to create work experience");
      }
    } catch (error) {
      console.error("Error creating work experience:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add work experience entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-2xl lg:py-4">
        <DialogHeader>
          <DialogTitle>Add New Work Experience</DialogTitle>
          <DialogDescription>Fill in the details to add a new work experience entry to your portfolio.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 lg-gap-0 lg:py-0">
          <div className="grid gap-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="company">Company*</Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Mountain View, CA"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="period">Period</Label>
            <Input
              id="period"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Jan 2020 - Present"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your work experience"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="responsibilities">Responsibilities (one per line)</Label>
            <Textarea
              id="responsibilities"
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              rows={4}
              placeholder="List responsibilities, one per line"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="technologies">Technologies (comma separated)</Label>
            <Input
              id="technologies"
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="e.g. React, Node.js"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyLogo">Company Logo</Label>
            <Input
              id="companyLogo"
              type="file"
              onChange={(e) => {
                if (e.target.files) {
                  setCompanyLogo(e.target.files[0]);
                }
              }}
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
              "Add Work Experience"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default WorkExperienceCreation