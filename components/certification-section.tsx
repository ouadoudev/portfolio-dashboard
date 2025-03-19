"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import {
  Award,
  CalendarDays,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Trash,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Certification {
  id: number;
  name: string;
  provider: string;
  details: string;
  date: string;
  certificateUrl: string;
}

interface CertificationSectionProps {
  certifications: Certification[];
  onCertificationUpdated: (updatedCertification: Certification) => void;
  onCertificationDeleted: (id: number) => void;
}

const CertificationSection: React.FC<CertificationSectionProps> = ({
  certifications,
  onCertificationUpdated,
  onCertificationDeleted,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingCertification, setEditingCertification] =
    useState<Certification | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCertificationId, setDeleteCertificationId] = useState<
    number | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<Certification>({
    id: 0,
    name: "",
    provider: "",
    details: "",
    date: "",
    certificateUrl: "",
  });

  const handleEdit = (certification: Certification) => {
    setEditingCertification(certification);
    setFormState(certification);
    setIsEditOpen(true);
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

  const handleUpdate = async () => {
    if (!editingCertification) return;
    setIsSubmitting(true);

    const updatedCertification = {
      ...editingCertification,
      ...formState,
    };

    try {
      const response = await fetch(
        `/api/certifications/${editingCertification.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCertification),
        }
      );

      if (response.ok) {
        const updatedData: Certification = await response.json();
        onCertificationUpdated(updatedData);
        setIsEditOpen(false);
        setEditingCertification(null);
        toast({
          title: "Success",
          description: "Certification updated successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to update certification");
      }
    } catch (error) {
      console.error("Error updating certification:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update certification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteCertificationId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteCertificationId) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `/api/certifications/${deleteCertificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        onCertificationDeleted(deleteCertificationId);
        toast({
          title: "Success",
          description: "Certification deleted successfully",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete certification");
      }
    } catch (error) {
      console.error("Error deleting certification:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete certification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDeleteOpen(false);
      setDeleteCertificationId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((certification) => (
          <Card key={certification.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-2">
                  <div>
                    <Award className="h-10 w-10 text-primary-600" />
                  </div>
                  <div className="flex flex-col justify-start">
                    <div className="text-sm lg:text-lg font-semibold text-gray-800">
                      {certification.name}
                    </div>
                    <CardDescription className="text-sm text-muted-foreground">
                      {certification.provider}
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="p-2">
                      <MoreHorizontal className="h-5 w-5 text-gray-600" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white border border-gray-200 rounded-md shadow-lg"
                  >
                    <DropdownMenuItem onClick={() => handleEdit(certification)}>
                      <Edit className="mr-2 h-4 w-4 text-gray-600" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => confirmDelete(certification.id)}
                    >
                      <Trash className="mr-2 h-4 w-4 text-red-600" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <CalendarDays className="mr-1 h-4 w-4" />
                {formatDate(certification.date)}
              </div>
              <div className="text-gray-700 text-base leading-relaxed h-20">
                {certification.details.length > 115
                  ? `${certification.details.slice(0, 115)}...`
                  : certification.details}
              </div>
            </CardContent>

            <CardFooter className="border-t p-4">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a
                  href={certification.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Certificate
                </a>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl lg:py-4">
          <DialogHeader>
            <DialogTitle>Edit Certification</DialogTitle>
            <DialogDescription>
              Update your certification details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Certification Name*</Label>
              <Input
                id="name"
                value={formState.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="provider">Provider*</Label>
              <Input
                id="provider"
                value={formState.provider}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={formState.details}
                onChange={handleFormChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date*</Label>
              <Input
                id="date"
                type="date"
                value={
                  editingCertification
                    ? new Date(editingCertification.date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="certificateUrl">Certificate URL*</Label>
              <Input
                id="certificateUrl"
                value={formState.certificateUrl}
                onChange={handleFormChange}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Certification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              certification entry from your portfolio.
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
              {isSubmitting ? "Deleting..." : "Delete Certification"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CertificationSection;
