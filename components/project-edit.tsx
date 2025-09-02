"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import Image from "next/image";
import { X } from "lucide-react";

interface ProjectData {
  title: string;
  description: string;
  domain: string;
  thumbnail: string | File | null;
  images: (string | File)[];
  iconLists: (string | File)[];
  liveUrl: string;
  githubUrl: string;
  keyFeatures: { title: string; description: string }[];
}

export function ProjectEdit() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<ProjectData>({
    title: "",
    description: "",
    domain: "",
    thumbnail: null,
    images: [],
    iconLists: [],
    liveUrl: "",
    githubUrl: "",
    keyFeatures: [],
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to fetch project");

        const project = await response.json();
        setFormData({
          title: project.title || "",
          description: project.description || "",
          domain: project.domain || "",
          thumbnail: project.thumbnail || null,
          images: project.images || [],
          iconLists: project.iconLists || [],
          liveUrl: project.liveUrl || "",
          githubUrl: project.githubUrl || "",
          keyFeatures: project.keyFeatures || [],
        });
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    if (id) fetchProject();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "images" || name === "iconLists" ? fileArray : fileArray[0],
      }));
    }
  };

  const [removedImages, setRemovedImages] = useState<(string | File)[]>([]);
  const [removedIcons, setRemovedIcons] = useState<(string | File)[]>([]);

  const handleRemoveFile = (name: keyof ProjectData, index?: number) => {
    setFormData((prev) => {
      if (name === "thumbnail") {
        return { ...prev, thumbnail: null }; // Remove thumbnail
      } else if (name === "images") {
        const updatedFiles = [...prev.images];
        const removedImage = updatedFiles[index!];
        updatedFiles.splice(index!, 1); // Remove the file at the specified index
        setRemovedImages((prevRemoved) => [...prevRemoved, removedImage]); // Track removed image
        return { ...prev, images: updatedFiles };
      } else if (name === "iconLists") {
        const updatedFiles = [...prev.iconLists];
        const removedIcon = updatedFiles[index!];
        updatedFiles.splice(index!, 1); // Remove the file at the specified index
        setRemovedIcons((prevRemoved) => [...prevRemoved, removedIcon]); // Track removed icon
        return { ...prev, iconLists: updatedFiles };
      }
      return prev;
    });
  };
  const handleFeatureChange = (
    index: number,
    field: "title" | "description",
    value: string
  ) => {
    const updatedFeatures = [...formData.keyFeatures];
    updatedFeatures[index][field] = value;
    setFormData((prev) => ({ ...prev, keyFeatures: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      keyFeatures: [...prev.keyFeatures, { title: "", description: "" }],
    }));
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.keyFeatures];
    updatedFeatures.splice(index, 1);
    setFormData((prev) => ({ ...prev, keyFeatures: updatedFeatures }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!formData.title || !formData.description || !formData.domain) {
      alert("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }

    try {
      const url = `/api/projects/${id}`;
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("domain", formData.domain);
      formDataToSend.append("liveUrl", formData.liveUrl);
      formDataToSend.append("githubUrl", formData.githubUrl);
      formDataToSend.append(
        "keyFeatures",
        JSON.stringify(formData.keyFeatures)
      );

      // Append thumbnail only if a new one is selected
      if (formData.thumbnail && typeof formData.thumbnail !== "string") {
        formDataToSend.append("thumbnail", formData.thumbnail);
      } else if (formData.thumbnail === null) {
        formDataToSend.append("removeThumbnail", "true"); // Indicate thumbnail removal
      }

      // Append new images only
      formData.images.forEach((image) => {
        if (typeof image !== "string") {
          formDataToSend.append("images", image);
        }
      });

      // Append new icons only
      formData.iconLists.forEach((icon) => {
        if (typeof icon !== "string") {
          formDataToSend.append("iconLists", icon);
        }
      });

      // Indicate removed images
      removedImages.forEach((img) => {
        formDataToSend.append("removedImages", img);
      });

      // Indicate removed icons
      removedIcons.forEach((icon) => {
        formDataToSend.append("removedIconLists", icon);
      });

      const response = await fetch(url, {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        const errorData = await response.json();
        console.error("Failed to update project:", errorData);
        alert("Failed to update project: " + errorData.error);
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("An error occurred while updating the project.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Project Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="domain">Project Domain</Label>
          <Select
            value={formData.domain}
            onValueChange={(value) => {
              const event = {
                target: {
                  name: "domain",
                  value: value,
                },
              } as React.ChangeEvent<HTMLSelectElement>;
              handleChange(event);
            }}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a domain" />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              <SelectItem value="Web Development">Web Development</SelectItem>
              <SelectItem value="Mobile Development">
                Mobile Development
              </SelectItem>
              <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
              <SelectItem value="DevOps">DevOps</SelectItem>
              <SelectItem value="Data Science">Data Science</SelectItem>
              <SelectItem value="Machine Learning">Machine Learning</SelectItem>
              <SelectItem value="AI & Simulation Modeling">
                AI & Simulation Modeling
              </SelectItem>
              <SelectItem value="Scientific Computing">
                Scientific Computing
              </SelectItem>
              <SelectItem value="Cyber Security">Cyber Security</SelectItem>
              <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Project Description</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          {formData.thumbnail && typeof formData.thumbnail === "string" && (
            <div className="space-y-2 relative">
              <Label>Current Thumbnail</Label>
              <div className="relative">
                <img
                  src={formData.thumbnail}
                  alt="Thumbnail"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile("thumbnail")}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="thumbnail">Upload New Thumbnail</Label>
            <Input
              type="file"
              id="thumbnail"
              name="thumbnail"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          {formData.images.length > 0 && (
            <div className="grid gap-2">
              <Label>Current Project Images</Label>
              <div className="flex gap-2 flex-wrap">
                {formData.images.map((img, index) =>
                  typeof img === "string" ? (
                    <div key={index} className="relative">
                      <Image
                        src={img}
                        alt={`Project image ${index}`}
                        width={100}
                        height={100}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("images", index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="images">Upload New Images</Label>
            <Input
              type="file"
              id="images"
              name="images"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div>
          {formData.iconLists.length > 0 && (
            <div className="grid gap-2">
              <Label>Current Icons</Label>
              <div className="flex gap-2 flex-wrap">
                {formData.iconLists.map((icon, index) =>
                  typeof icon === "string" ? (
                    <div key={index} className="relative">
                      <Image
                        src={icon}
                        alt={`Project icon ${index}`}
                        width={50}
                        height={50}
                        className="rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile("iconLists", index)}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="iconLists">Upload New Icons</Label>
            <Input
              type="file"
              id="iconLists"
              name="iconLists"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      <div className="grid gap-2">
        <Label>Key Features</Label>
        {formData.keyFeatures.map((feature, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-2 relative border p-2 rounded-lg"
          >
            <div className="grid gap-1">
              <Label>Title</Label>
              <Input
                value={feature.title}
                onChange={(e) =>
                  handleFeatureChange(index, "title", e.target.value)
                }
                placeholder="Feature title"
              />
            </div>
            <div className="grid gap-1">
              <Label>Description</Label>
              <Textarea
                value={feature.description}
                onChange={(e) =>
                  handleFeatureChange(index, "description", e.target.value)
                }
                rows={2}
                placeholder="Feature description"
              />
            </div>
            <button
              type="button"
              onClick={() => removeFeature(index)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X size={12} />
            </button>
          </div>
        ))}
        <Button type="button" onClick={addFeature} variant="outline">
          + Add Feature
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="liveUrl">Live URL</Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Project"}
        </Button>
      </div>
    </form>
  );
}
