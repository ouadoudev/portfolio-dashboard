"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react"; // Import an icon for the remove button
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface ProjectFormProps {}

export function ProjectForm({}: ProjectFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    domain: string;
    thumbnail: File | null;
    images: File[];
    iconLists: File[];
    liveUrl: string;
    githubUrl: string;
    keyFeatures: { title: string; description: string }[];
  }>({
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
          name === "images" || name === "iconLists"
            ? [...prev[name], ...fileArray]
            : fileArray[0],
      }));
    }
  };

  const handleRemoveFile = (name: keyof typeof formData, index?: number) => {
    setFormData((prev) => {
      if (name === "thumbnail") {
        return { ...prev, thumbnail: null }; // Remove thumbnail
      } else if (name === "images" || name === "iconLists") {
        const updatedFiles = [...prev[name]];
        updatedFiles.splice(index!, 1); // Remove the file at the specified index
        return { ...prev, [name]: updatedFiles };
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

    try {
      const url = "/api/projects";
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("domain", formData.domain);
      formDataToSend.append("liveUrl", formData.liveUrl);
      formDataToSend.append("githubUrl", formData.githubUrl);
      formDataToSend.append("keyFeatures", JSON.stringify(formData.keyFeatures))

      if (formData.thumbnail) {
        formDataToSend.append("thumbnail", formData.thumbnail);
      }

      formData.images.forEach((image) =>
        formDataToSend.append("images", image)
      );
      formData.iconLists.forEach((icon) =>
        formDataToSend.append("iconLists", icon)
      );

      const response = await fetch(url, {
        method: "POST", // Always use POST
        body: formDataToSend,
      });

      if (response.ok) {
        router.push("/projects");
        router.refresh();
      } else {
        console.error("Failed to save project");
      }
    } catch (error) {
      console.error("Error saving project:", error);
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
            placeholder="e.g. E-Commerce Platform"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="domain">Project Domain</Label>
          <Select
            value={formData.domain}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, domain: value }))
            }
          >
            <SelectTrigger id="domain">
              <SelectValue placeholder="Select category" />
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
          placeholder="Brief description of your project"
          value={formData.description}
          rows={4}
          onChange={handleChange}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="thumbnail">Thumbnail</Label>
          {formData.thumbnail && (
            <div className="relative">
              <img
                src={URL.createObjectURL(formData.thumbnail)}
                alt="Thumbnail Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile("thumbnail")}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X size={8} />
              </button>
            </div>
          )}
          <Input
            type="file"
            id="thumbnail"
            name="thumbnail"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid  gap-2">
          <div>
            <Label htmlFor="images">Project Images</Label>
            <div className="flex gap-2 flex-wrap">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Project Image ${index}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile("images", index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <Input
              type="file"
              id="images"
              name="images"
              multiple
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="iconLists">Project Icons</Label>
          <div className="flex gap-3 flex-wrap">
            {formData.iconLists.map((icon, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(icon)}
                  alt={`Project Icon ${index}`}
                  className="w-12 h-12 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFile("iconLists", index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          <Input
            type="file"
            id="iconLists"
            name="iconLists"
            multiple
            onChange={handleFileChange}
          />
        </div>
      </div>
            <div className="grid gap-2">
        <Label>Key Features</Label>
        {formData.keyFeatures.map((feature, index) => (
          <div
            key={index}
            className="grid grid-cols-2 gap-2 items-start border p-2 rounded-lg relative"
          >
            <div className="grid gap-1">
              <Label htmlFor={`feature-title-${index}`}>Title</Label>
              <Input
                id={`feature-title-${index}`}
                value={feature.title}
                onChange={(e) =>
                  handleFeatureChange(index, "title", e.target.value)
                }
                placeholder="Feature title"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`feature-desc-${index}`}>Description</Label>
              <Textarea
                id={`feature-desc-${index}`}
                value={feature.description}
                onChange={(e) =>
                  handleFeatureChange(index, "description", e.target.value)
                }
                placeholder="Feature description"
                rows={2}
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
          <Label htmlFor="liveUrl">Live Demo URL</Label>
          <Input
            id="liveUrl"
            name="liveUrl"
            placeholder="https://example.com"
            value={formData.liveUrl}
            onChange={handleChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="githubUrl">GitHub URL</Label>
          <Input
            id="githubUrl"
            name="githubUrl"
            placeholder="https://github.com/username/repo"
            value={formData.githubUrl}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Project"}
        </Button>
      </div>
    </form>
  );
}
