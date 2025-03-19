"use client";

import { useState } from "react";
import { Edit, Trash, MoreHorizontal, MessageSquareQuote } from "lucide-react";
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

interface Testimonial {
  id: number;
  quote: string;
  authorName: string;
  authorPosition: string;
  authorImage: string | File | null;
}

interface TestimonialSectionProps {
  testimonials?: Testimonial[];
  onTestimonialUpdated: (updatedTestimonial: Testimonial) => void;
  onTestimonialDeleted: (id: number) => void;
}

export default function TestimonialSection({
  testimonials = [],
  onTestimonialUpdated,
  onTestimonialDeleted,
}: TestimonialSectionProps) {
  const [isEditTestimonialOpen, setIsEditTestimonialOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);
  const [deletingTestimonialId, setDeletingTestimonialId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Testimonial>({
    id: 0,
    quote: "",
    authorName: "",
    authorPosition: "",
    authorImage: null,
  });
  const [authorImageFile, setAuthorImageFile] = useState<File | null>(null);

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormState(testimonial);
    setAuthorImageFile(null);
    setIsEditTestimonialOpen(true);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAuthorImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    if (!editingTestimonial) return;
    setIsSubmitting(true);

    const updatedTestimonial = {
      ...editingTestimonial,
      ...formState,
      authorImage: authorImageFile || editingTestimonial.authorImage,
    };

    try {
      const formData = new FormData();
      Object.entries(updatedTestimonial).forEach(([key, value]) => {
        if (value !== null) {
          if (typeof value === "string" || value instanceof File) {
            formData.append(key, value);
          }
        }
      });

      if (authorImageFile) {
        formData.append("authorImage", authorImageFile);
      } else if (typeof updatedTestimonial.authorImage === "string") {
        formData.append("authorImage", updatedTestimonial.authorImage);
      }

      const response = await fetch(
        `/api/testimonials/${editingTestimonial.id}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedData: Testimonial = await response.json();
        onTestimonialUpdated(updatedData);
        setIsEditTestimonialOpen(false);
        setEditingTestimonial(null);
        toast({
          title: "Success",
          description: "Testimonial updated successfully",
        });
      } else {
        let errorMessage = "Failed to update testimonial";
        try {
          const error = await response.json();
          errorMessage = error.message || errorMessage;
        } catch (jsonError) {
          console.error("Error parsing JSON response:", jsonError);
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update testimonial",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeletingTestimonialId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTestimonialId) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/testimonials/${deletingTestimonialId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        onTestimonialDeleted(deletingTestimonialId);
        toast({
          title: "Success",
          description: "Testimonial deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete testimonial");
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete testimonial",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
      setDeletingTestimonialId(null);
    }
  };

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium mb-2">No testimonials yet</h3>
        <p className="text-muted-foreground mb-4">
          Add testimonials to showcase your work.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id} className="flex flex-col">
            <CardHeader className="relative pb-0">
              <MessageSquareQuote className="h-12 w-12 text-primary/20 absolute top-3 left-4" />
              <div className="absolute top-4 right-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(testimonial)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirmDelete(testimonial.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6">
              <p className="text-muted-foreground italic">
                "{testimonial.quote}"
              </p>
            </CardContent>
            <CardFooter className="flex items-center gap-4 border-t p-4">
              <Avatar className="h-12 w-12" >
                <AvatarImage
                  src={
                    typeof testimonial.authorImage === "string"
                      ? testimonial.authorImage
                      : undefined
                  }
                  alt={testimonial.authorName}
                />
                <AvatarFallback>
                  {testimonial.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{testimonial.authorName}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.authorPosition}
                </p>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog
        open={isEditTestimonialOpen}
        onOpenChange={setIsEditTestimonialOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>
              Update your testimonial details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 lg:gap-2 lg:py-0 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quote">Quote*</Label>
              <Textarea
                id="quote"
                value={formState.quote}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorName">Author Name*</Label>
              <Input
                id="authorName"
                value={formState.authorName}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorPosition">Author Position</Label>
              <Input
                id="authorPosition"
                value={formState.authorPosition}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorImage">Author Image</Label>
              <Input
                id="authorImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditTestimonialOpen(false)}
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
                "Update Testimonial"
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
              testimonial from your portfolio.
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
