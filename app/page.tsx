"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { User, Briefcase, GraduationCap, Award, Wrench, MessageSquare, Contact } from "lucide-react"
import { useLanguage } from "@/context/language-context"
import { useEffect, useState } from "react"


interface Counts {
  workExperiences: number;
  education: number;
  certifications: number;
  technologies: number;
  projects: number;
  testimonials: number;

}


export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({
    workExperiences: 0,
    education: 0,
    certifications: 0,
    technologies: 0,
    projects: 0,
    testimonials: 0,
  });
  const [isLoading, setIsLoading] = useState(true);


  const { t } = useLanguage()

  useEffect(()=>{
    fetchCounts();
  },[])

  const fetchCounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/count');
      if(!response.ok){
        throw new Error(" Failed to fetch counts");
      }
      const data: Counts = await response.json();
      setCounts(data);
      
    } catch (error) {
      console.error(error);
    }finally{
      setIsLoading(false);
    }
  }

  const quickAccessItems = [
    {
      id: "profile",
      href: "/profile",
      icon: <User className="h-8 w-8 text-primary" />,
      title: t("dashboard.profile"),
      description: t("dashboard.manage_personal"),
    },
    {
      id: "work-experience",
      href: "/work-experience",
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: t("dashboard.work_experience"),
      description: t("dashboard.manage_professional"),
    },
    {
      id: "education",
      href: "/education",
      icon: <GraduationCap className="h-8 w-8 text-primary" />,
      title: t("dashboard.education"),
      description: t("dashboard.manage_academic"),
    },
    {
      id: "certifications",
      href: "/certifications",
      icon: <Award className="h-8 w-8 text-primary" />,
      title: t("dashboard.certifications"),
      description: t("dashboard.showcase_achievements"),
    },
    {
      id: "technologies",
      href: "/technologies",
      icon: <Wrench className="h-8 w-8 text-primary" />,
      title: t("dashboard.technologies"),
      description: t("dashboard.highlight_skills"),
    },
    {
      id: "testimonials",
      href: "/testimonials",
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: t("dashboard.testimonials"),
      description: t("dashboard.display_feedback"),
    },
    {
      id: "contact",
      href: "/contact",
      icon: <Contact className="h-8 w-8 text-primary" />,
      title: t("dashboard.contact"),
      description: t("dashboard.manage_contact"),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.work_experience")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.workExperiences}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.positions")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.projects")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.projects}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.positions")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.education")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.education}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.degrees")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.certifications")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.certifications}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.certificates")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.technologies")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.technologies}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.skills")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.testimonials")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.testimonials}</div>
            <p className="text-xs text-muted-foreground">{t("dashboard.reviews")}</p>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mt-6">{t("dashboard.quick_access")}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {quickAccessItems.map(({ id, href, icon, title, description }) => (
          <Link key={id} href={href}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors h-full">
              <CardHeader>
                {icon}
                <CardTitle className="mt-4">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

