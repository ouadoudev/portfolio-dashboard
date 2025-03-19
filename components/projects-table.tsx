"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Edit, ExternalLink, MoreHorizontal, Trash } from "lucide-react";

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  iconLists: string[];
  link: string;
}

export function ProjectsTable() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch("/api/projects");
        if (response.ok) {
          const data = await response.json();
          setProjects(data);
        } else {
          console.error("Failed to fetch projects");
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        const response = await fetch(`/api/projects/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setProjects(projects.filter((project) => project.id !== id));
        } else {
          console.error("Failed to delete project");
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading...</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Technologies</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No projects found. Add your first project!
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.id}</TableCell>
                <TableCell>
                  {project.thumbnail ? (
                    <div className="h-12 w-16 overflow-hidden rounded-md">
                      <Image
                        src={project.thumbnail || "/placeholder.svg"}
                        alt={project.title}
                        width={64}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-16 rounded-md bg-gray-100 flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </TableCell>
                <TableCell>{project.title}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {project.description}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.iconLists && project.iconLists.length > 0 ? (
                      project.iconLists.slice(0, 3).map((icon, index) => (
                        <div key={index} className="flex items-center space-x-1">
                          <img
                            src={icon}
                            alt={`Icon ${index + 1}`}
                            className="h-6 w-6 object-contain"
                          />
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        No technologies
                      </span>
                    )}
                    {project.iconLists && project.iconLists.length > 3 && (
                      <Badge variant="outline" className="px-2 py-0">
                        +{project.iconLists.length - 3}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={`/projects/${project.id}`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      {project.link && (
                        <DropdownMenuItem asChild>
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Project
                          </a>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(project.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
