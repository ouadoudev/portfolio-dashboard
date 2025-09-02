"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { BadgeCheck, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";

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

interface UserProfileSectionProps {
  initialUser: User;
}

export default function UserProfileSection({
  initialUser,
}: UserProfileSectionProps) {
  const [user, setUser] = useState<User>(initialUser);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [formData, setFormData] = useState<User>(initialUser);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage()
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    const formDataToSend = new FormData();

    // Add text fields
    formDataToSend.append("fullName", formData.fullName);
    formDataToSend.append("title", formData.title);
    formDataToSend.append("tagline", formData.tagline);
    formDataToSend.append("introduction", formData.introduction);
    formDataToSend.append("status", formData.status);
    formDataToSend.append(
      "yearsOfExperience",
      formData.yearsOfExperience.toString()
    );
    formDataToSend.append(
      "keySkills",
      Array.isArray(formData.keySkills)
        ? formData.keySkills.join(", ")
        : formData.keySkills
    );

    // Handle file uploads
    const profileImageInput = document.getElementById(
      "profileImage"
    ) as HTMLInputElement;
    const cvInput = document.getElementById("cv") as HTMLInputElement;

    if (profileImageInput.files && profileImageInput.files[0]) {
      formDataToSend.append("image", profileImageInput.files[0]);
    }

    if (cvInput.files && cvInput.files[0]) {
      formDataToSend.append("cv", cvInput.files[0]);
    }

    try {
      const response = await fetch(`/api/portfolio/${user.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setIsEditProfileOpen(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error: unknown) {
      console.error("Error updating user data:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return <div>User not found</div>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("profile.title")}</h1>
        <Button
          onClick={() => {
            setFormData(user);
            setIsEditProfileOpen(true);
          }}
             className="min-w-[140px]"
              size="sm"
        >
          <Edit className="mr-2 h-4 w-4" />
          {t("profile.edit_profile")}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user.image} alt={user.fullName} />
                <AvatarFallback>
                  {user.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{user.fullName}</CardTitle>
            <CardDescription>{user.title}</CardDescription>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                <BadgeCheck className="mr-1 h-3 w-3" />
                {user.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                {t("profile.experience")}
                </h3>
                <p className="font-medium">{user.yearsOfExperience} {t("profile.years")}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">
                {t("profile.resume")}
                </h3>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a href={user.cv} download>
                    <Upload className="mr-2 h-4 w-4" />
                    {t("profile.download_cv")}
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("profile.about_me")}</CardTitle>
            <CardDescription>{user.tagline}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">{t("profile.introduction")}</h3>
              <p className="text-muted-foreground">{user.introduction}</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">{t("profile.key_skills")}</h3>
              <div className="flex flex-wrap gap-2">
                {user.keySkills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="max-w-3xl py-8">
          <DialogHeader>
            <DialogTitle> {t("profile.edit_profile")}</DialogTitle>
            <DialogDescription>Update your profile details</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateUser}
            className="grid gap-4 py-2 px-2 max-h-[70vh] overflow-y-auto "
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
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
              <div className="grid gap-2">
                <Label htmlFor="status">Availability Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="max-h-52 overflow-y-auto">
                    <SelectItem value="Open to Work">Open to work</SelectItem>
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
              <div className="grid gap-2">
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
            <div className="grid gap-2">
              <Label htmlFor="keySkills">Key Skills (comma separated)</Label>
              <Input
                id="keySkills"
                name="keySkills"
                value={
                  Array.isArray(formData.keySkills)
                    ? formData.keySkills.join(", ")
                    : formData.keySkills
                }
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <Input id="profileImage" name="image" type="file" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cv">Resume/CV</Label>
              <Input id="cv" name="cv" type="file" />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditProfileOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
