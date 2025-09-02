"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProjectEdit } from "@/components/project-edit";
import { Badge } from "@/components/ui/badge";

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data);
        } else {
          console.error("Failed to fetch project");
          router.push("/projects");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        router.push("/projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <main className="flex flex-1 flex-col items-center justify-center">
          Loading...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <main className="mx-6 ">
        <Badge className="text-xs text-center m-2">Edit Project</Badge>
        <div className="rounded-md border p-4 md:p-6">
          <ProjectEdit initialData={project} />
        </div>
      </main>
    </div>
  );
}
