import { DashboardHeader } from "@/components/dashboard-header";
import { ProjectForm } from "@/components/project-form";
import { Badge } from "@/components/ui/badge";

export default function NewProjectPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader />
      <main className="mx-6 ">
        <Badge className="text-xs text-center m-2"> New Project</Badge>
        <div className="rounded-md border p-4 md:p-6">
          <ProjectForm />
        </div>
      </main>
    </div>
  );
}
