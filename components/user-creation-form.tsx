"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

interface User {
  id: number;
  fullName: string;
  image: string;
  title: string;
  tagline: string;
  introduction: string;
  keySkills: string[];
  status: string;
  cv: string;
  yearsOfExperience: number;
}

interface UserCreationFormProps {
  onUserCreated: (user: User) => void;
}

export default function UserCreationForm({
  onUserCreated,
}: UserCreationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    tagline: "",
    introduction: "",
    keySkills: "",
    status: "Open to work",
    yearsOfExperience: 0,
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Add files
      const imageInput = document.getElementById(
        "profileImage"
      ) as HTMLInputElement;
      const cvInput = document.getElementById("cv") as HTMLInputElement;

      if (imageInput.files && imageInput.files[0]) {
        formDataToSend.append("image", imageInput.files[0]);
      }

      if (cvInput.files && cvInput.files[0]) {
        formDataToSend.append("cv", cvInput.files[0]);
      }

      const response = await fetch("/api/portfolio", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const newUser = await response.json();
        toast({
          title: "Profile created",
          description: "Your profile has been created successfully.",
        });
        onUserCreated(newUser);
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to create profile");
      }
    } catch (error: unknown) {
      console.error("Error creating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create Your Profile</CardTitle>
        <CardDescription>
          Fill in your details to create your professional profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              value={formData.tagline}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="introduction">Introduction</Label>
            <Textarea
              id="introduction"
              name="introduction"
              rows={4}
              value={formData.introduction}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Availability Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="max-h-52 overflow-y-auto">
                  <SelectItem value="Open to work">Open to work</SelectItem>
                  <SelectItem value="Freelancing">Freelancing</SelectItem>
                  <SelectItem value="Employed">Employed</SelectItem>
                  <SelectItem value="Available for Collaboration">
                    Available for Collaboration
                  </SelectItem>
                  <SelectItem value="Working on Personal Projects">
                    Working on Personal Projects
                  </SelectItem>
                  <SelectItem value="Interning">Interning</SelectItem>
                  <SelectItem value="Exploring New Technologies">
                    Exploring New Technologies
                  </SelectItem>
                  <SelectItem value="Unavailable">Unavailable</SelectItem>
                  <SelectItem value="Remote Only">Remote Only</SelectItem>
                  <SelectItem value="Contract-Based Work Only">
                    Contract-Based Work Only
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input
                id="yearsOfExperience"
                name="yearsOfExperience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keySkills">Key Skills (comma separated)</Label>
            <Input
              id="keySkills"
              name="keySkills"
              value={formData.keySkills}
              onChange={handleChange}
              placeholder="React, Next.js, TypeScript, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileImage">Profile Image</Label>
            <Input id="profileImage" name="image" type="file" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cv">Resume/CV</Label>
            <Input id="cv" name="cv" type="file" />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Profile..." : "Create Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
