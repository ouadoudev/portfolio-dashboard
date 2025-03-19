// components/WorkExperienceSection.tsx
"use client";

import { useState } from "react";
import {
  Edit,
  Trash,
  MoreHorizontal,
  CalendarDays,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface WorkExperience {
  id: number;
  title: string;
  company: string;
  location: string;
  period: string;
  description: string;
  responsibilities: string[];
  technologies: string[];
  companyLogo: string | File | null;
}

interface WorkExperienceSectionProps {
  workExperiences?: WorkExperience[];
  onWorkExperienceUpdated: (updatedExperience: WorkExperience) => void;
  onWorkExperienceDeleted: (id: number) => void;
}

export default function WorkExperienceSection({
  workExperiences = [],
  onWorkExperienceUpdated,
  onWorkExperienceDeleted,
}: WorkExperienceSectionProps) {
  const [isEditExperienceOpen, setIsEditExperienceOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] =
    useState<WorkExperience | null>(null);
  const [deletingExperienceId, setDeletingExperienceId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<WorkExperience>({
    id: 0,
    title: "",
    company: "",
    location: "",
    period: "",
    description: "",
    responsibilities: [],
    technologies: [],
    companyLogo: null,
  });
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);

  const handleEdit = (experience: WorkExperience) => {
    setEditingExperience(experience);
    setFormState(experience);
    setCompanyLogoFile(null);
    setIsEditExperienceOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]:
        id === "responsibilities"
          ? value.split("\n").map((item) => item.trim())
          : id === "technologies"
          ? value.split(",").map((item) => item.trim())
          : value,
    }));
  };
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCompanyLogoFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!editingExperience) return;
    setIsSubmitting(true);

    const updatedExperience = {
      ...editingExperience,
      ...formState,
      companyLogo: companyLogoFile || editingExperience.companyLogo,
    };

    try {
      const formData = new FormData();
      Object.entries(updatedExperience).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Append each item in the array individually
          value.forEach((item) => formData.append(key, item));
        } else if (value !== null) {
          if (typeof value === "string" || value instanceof File) {
            formData.append(key, value);
          }
        }
      });

      if (companyLogoFile) {
        formData.append("companyLogo", companyLogoFile);
      } else if (typeof updatedExperience.companyLogo === "string") {
        formData.append("companyLogo", updatedExperience.companyLogo);
      }

      const response = await fetch(
        `/api/work-experience/${editingExperience.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData: WorkExperience = await response.json();
        onWorkExperienceUpdated(updatedData);
        setIsEditExperienceOpen(false);
        setEditingExperience(null);
        toast({
          title: "Success",
          description: "Work experience entry updated successfully",
        });
      } else {
        let errorMessage = "Failed to update work experience";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating work experience:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update work experience entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingExperienceId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingExperienceId) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/work-experience/${deletingExperienceId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        onWorkExperienceDeleted(deletingExperienceId);
        toast({
          title: "Success",
          description: "Work experience entry deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete work experience");
      }
    } catch (error) {
      console.error("Error deleting work experience:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete work experience entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingExperienceId(null);
    }
  };

  if (workExperiences.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">
          No work experience entries yet
        </h3>
        <p className="text-muted-foreground mb-4">
          Add your work experience to showcase your qualifications.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {workExperiences.map((experience) => (
          <Card key={experience.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 rounded-md">
                    <AvatarImage
                      src={
                        typeof experience.companyLogo === "string"
                          ? experience.companyLogo
                          : undefined
                      }
                      alt={experience.company}
                    />
                    <AvatarFallback className="rounded-md">
                      {experience.company.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{experience.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {experience.company}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(experience)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirmDelete(experience.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <MapPin className="mr-1 h-4 w-4" />
                {experience.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <CalendarDays className="mr-1 h-4 w-4" />
                {experience.period}
              </div>
              <p className="text-sm mb-4">{experience.description}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Responsibilities:</h4>
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {experience.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary">
                    {tech}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog
        open={isEditExperienceOpen}
        onOpenChange={setIsEditExperienceOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Work Experience</DialogTitle>
            <DialogDescription>
              Update your work experience details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:gap-2 lg:py-0 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title*</Label>
              <Input
                id="title"
                value={formState.title}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="company">Company*</Label>
              <Input
                id="company"
                value={formState.company}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formState.location}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={formState.period}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="responsibilities">
                Responsibilities (one per line)
              </Label>
              <Textarea
                id="responsibilities"
                value={formState.responsibilities.join("\n")} 
                onChange={handleFormChange}
                rows={4}
                placeholder="List responsibilities, one per line"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="technologies">
                Technologies (comma separated)
              </Label>
              <Textarea
                id="technologies"
                value={formState.technologies.join(", ")} 
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyLogo">Company Logo</Label>
              <Input
                id="companyLogo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditExperienceOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Updating...
                </>
              ) : (
                "Update Work Experience"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              work experience entry from your portfolio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
