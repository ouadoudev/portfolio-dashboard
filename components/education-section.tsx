"use client";

import { useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  MapPin,
  Edit,
  Trash,
  MoreHorizontal,
  School,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
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

interface Education {
  id: number;
  degree: string;
  institution: string;
  location: string;
  period: string;
  description: string;
  courses: string[];
  options: string;
}

interface EducationSectionProps {
  educations?: Education[];
  onEducationUpdated: (updatedEducation: Education) => void;
  onEducationDeleted: (id: number) => void;
}

export default function EducationSection({
  educations = [],
  onEducationUpdated,
  onEducationDeleted,
}: EducationSectionProps) {
  const [isEditEducationOpen, setIsEditEducationOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(
    null
  );
  const [deletingEducationId, setDeletingEducationId] = useState<number | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Education>({
    id: 0,
    degree: "",
    institution: "",
    location: "",
    period: "",
    description: "",
    courses: [],
    options: "",
  });

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setFormState(education);
    setIsEditEducationOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]:
        id === "courses"
          ? value.split("\n").filter((course) => course.trim() !== "")
          : value,
    }));
  };

  const handleUpdate = async () => {
    if (!editingEducation) return;
    setIsSubmitting(true);

    const updatedEducation = {
      ...editingEducation,
      ...formState,
    };

    try {
      const response = await fetch(`/api/education/${editingEducation.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEducation),
      });

      if (response.ok) {
        const updatedData: Education = await response.json();
        onEducationUpdated(updatedData);
        setIsEditEducationOpen(false);
        setEditingEducation(null);
        toast({
          title: "Success",
          description: "Education entry updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update education");
      }
    } catch (error) {
      console.error("Error updating education:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update education entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingEducationId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEducationId) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/education/${deletingEducationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onEducationDeleted(deletingEducationId);
        toast({
          title: "Success",
          description: "Education entry deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete education");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete education entry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingEducationId(null);
    }
  };

  if (educations.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No education entries yet</h3>
        <p className="text-muted-foreground mb-4">
          Add your educational background to showcase your qualifications.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {educations.map((education) => (
          <Card key={education.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  <div>
                    <GraduationCap className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex flex-col justify-start">
                    <div className="text-base font-bold text-gray-800">
                      {education.degree}
                    </div>
                    <CardDescription className="mt-1 text-muted-foreground">
                      {education.options && (
                        <div className="">
                          <span className="inline-flex items-center rounded-md bg-muted px-2  text-nowrap text-xs ">
                            {education.options}
                          </span>
                        </div>
                      )}
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
                    <DropdownMenuItem onClick={() => handleEdit(education)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirmDelete(education.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center text-sm text-muted-foreground mb-1">
                  <School className="mr-1 h-4 w-4" />
                  {education.institution}
                </div>
              <div className="lg:flex lg:items-center justify-between">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="mr-1 h-4 w-4" />
                  {education.location || "Location not specified"}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-1 h-4 w-4" />
                  {education.period || "Period not specified"}
                </div>
              </div>
              <div className="text-gray-700 text-sm leading-relaxed h-12 mt-3">
                {education.description.length > 180
                  ? `${education.description.slice(0, 180)}...`
                  : education.description}
              </div>
            </CardContent>
            <CardFooter>
              {education.courses && education.courses.length > 0 && (
                <div>
                  <h4 className="font-semibold ">Key Courses:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <ul className="list-disc pl-5 text-xs lg:text-sm space-y-1 font-sans">
                      {education.courses
                        .slice(0, Math.ceil(education.courses.length / 2))
                        .map((course, index) => (
                          <li key={index}>{course}</li>
                        ))}
                    </ul>
                    <ul className="list-disc pl-5 text-xs lg:text-sm space-y-1 font-sans">
                      {education.courses
                        .slice(Math.ceil(education.courses.length / 2))
                        .map((course, index) => (
                          <li key={index}>{course}</li>
                        ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog open={isEditEducationOpen} onOpenChange={setIsEditEducationOpen}>
        <DialogContent className="max-w-3xl lg:py-3">
          <DialogHeader>
            <DialogTitle>Edit Education</DialogTitle>
            <DialogDescription>
              Update your education details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:gap-2 lg:py-0 py-4">
            <div className="grid gap-2">
              <Label htmlFor="degree">Degree/Certificate*</Label>
              <Input
                id="degree"
                value={formState.degree}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="institution">Institution*</Label>
                <Input
                  id="institution"
                  value={formState.institution}
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="period">Period</Label>
                <Input
                  id="period"
                  value={formState.period}
                  onChange={handleFormChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="options">Options (GPA, Honors, etc.)</Label>
                <Input
                  id="options"
                  value={formState.options}
                  onChange={handleFormChange}
                />
              </div>
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
              <Label htmlFor="courses">Key Courses (one per line)</Label>
              <Textarea
                id="courses"
                rows={4}
                value={formState.courses.join("\n")}
                onChange={handleFormChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditEducationOpen(false)}
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
                "Update Education"
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
              education entry from your portfolio.
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
