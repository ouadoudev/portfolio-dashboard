"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Award,
  Wrench,
  Contact,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/context/language-context";

export default function SidebarComponent() {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const routes = [
    {
      label: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      href: "/",
      color: "text-sky-500",
    },
    {
      label: t("sidebar.profile"),
      icon: User,
      href: "/profile",
      color: "text-violet-500",
    },
    {
      label: t("sidebar.education"),
      icon: GraduationCap,
      href: "/education",
      color: "text-emerald-500",
    },
    {
      label: t("sidebar.certifications"),
      icon: Award,
      href: "/certification",
      color: "text-blue-500",
    },
    {
      label: t("sidebar.projects"),
      icon: FolderKanban,
      href: "/projects",
      color: "text-yellow-500",
    },
    {
      label: t("sidebar.work_experience"),
      icon: Briefcase,
      href: "/work-experience",
      color: "text-emerald-500",
    },
    {
      label: t("sidebar.technologies"),
      icon: Wrench,
      href: "/technologies",
      color: "text-orange-500",
    },
    {
      label: t("sidebar.testimonials"),
      icon: MessageSquare,
      href: "/testimonials",
      color: "text-pink-700",
    },
    {
      label: t("sidebar.contact"),
      icon: Contact,
      href: "/contact",
      color: "text-blue-500",
    },
  ];

  return (
    <Sidebar
      side={isRTL ? "right" : "left"}
      direction={isRTL ? "rtl" : "ltr"}
      className={cn(isRTL ? "right-0 left-auto" : "left-0")}
    >
      <SidebarHeader className="border-b mb-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">
            {t("sidebar.portfolio_dashboard")}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {routes.map((route) => (
            <SidebarMenuItem key={route.href}>
              <SidebarMenuButton asChild isActive={pathname === route.href}>
                <Link href={route.href} className="flex items-center gap-2">
                  <route.icon className={cn("h-4 w-4", route.color)} />
                  <span>{route.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t p-6">
        <div className="text-xs text-muted-foreground">
          © 2025 Mohamed Ouadou
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
