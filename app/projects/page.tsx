"use client";
import {
  Edit,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Github,
  Trash,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  iconLists: string[];
  link: string;
  liveUrl: string;
  githubUrl: string;
  domain: string;
}

export default function ProjectsPage() {
  const [view, setView] = useState("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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

  const handleAdd = () => {
    router.push("/projects/new");
  };

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
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-8 py-4 ">
      <main className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <div className="flex items-center gap-4">
            <Tabs value={view} onValueChange={setView} className="w-[200px]">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button onClick={handleAdd} className="bg-black hover:bg-slate-900 text-white rounded-xl h-10">
              <Plus className="mr-1 h-4 w-4" />
              Add Project
            </Button>
          </div>
        </div>
        <Tabs value={view} onValueChange={setView}>
          <TabsContent value="grid">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="overflow-hidden flex flex-col"
                >
                  <div className="relative h-48">
                    <img
                      src={project.thumbnail || "/placeholder.svg"}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Link
                              className="flex items-center gap-2"
                              href={`/projects/${project.id}`}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(project.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">
                        {project.title}
                      </CardTitle>
                      <Badge className="text-xs text-center">
                        {project.domain}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground mb-4">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {project.iconLists && project.iconLists.length > 0 ? (
                        project.iconLists.slice(0, 6).map((icon, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1"
                          >
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
                      {project.iconLists.length > 6 && (
                        <Badge variant="outline" className="px-2 py-0">
                          +{project.iconLists.length - 6}
                        </Badge>
                      )}
                    </div>
                    {/* <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {tag}
                      </Badge>
                    ))}
                  </div> */}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Live Demo
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead className="text-center">Domain</TableHead>
                    <TableHead className="text-center">Technologies</TableHead>
                    <TableHead className="text-center">Links</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="text-sm font-bold">{project.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.description.substring(0, 60)}...
                        </div>
                      </TableCell>
                      <TableCell className="text-nowrap">
                        <Badge>{project.domain}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-nowrap gap-1">
                          {project.iconLists && project.iconLists.length > 0 ? (
                            project.iconLists.slice(0, 4).map((icon, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-1"
                              >
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
                          {project.iconLists.length > 4 && (
                            <Badge variant="outline" className="px-2 py-0">
                              +{project.iconLists.length - 4}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            asChild
                          >
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Github className="h-2 w-2" />
                            </a>
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            asChild
                          >
                            <a
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-2 w-2" />
                            </a>
                          </Button>
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
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
