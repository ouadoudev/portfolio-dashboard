"use client";

import type React from "react";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ArrowUpDown,
  Check,
  Download,
  Edit,
  Filter,
  Grid,
  Info,
  Layers,
  LayoutGrid,
  List,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// Technology type definition
interface Technology {
  id: number;
  category: string;
  name: string;
  icon: string;
}

// Cache interface
interface Cache {
  data: Technology[];
  timestamp: number;
}

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

// View mode options
type ViewMode = "grid" | "list" | "compact";

// Sort options
type SortField = "name" | "category" | "id";
type SortDirection = "asc" | "desc";

export default function TechnologiesSection() {
  const router = useRouter();
  const { toast } = useToast();

  // State for technologies data
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // UI state
  const [isAddTechnologyOpen, setIsAddTechnologyOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [editingTechnology, setEditingTechnology] = useState<Technology | null>(
    null
  );
  const [deletingTechnology, setDeletingTechnology] =
    useState<Technology | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Frontend",
    icon: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showCategoryBadges, setShowCategoryBadges] = useState(true);

  // Function to fetch technologies from the API
  const fetchTechnologies = useCallback(async (skipCache = false) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first if not skipping cache
      if (!skipCache) {
        const cachedData = localStorage.getItem("technologiesCache");
        if (cachedData) {
          const cache: Cache = JSON.parse(cachedData);
          const now = new Date().getTime();

          // If cache is still valid, use it
          if (now - cache.timestamp < CACHE_DURATION) {
            setTechnologies(cache.data);
            setIsLoading(false);
            return cache.data;
          }
        }
      }

      // Fetch fresh data
      const response = await fetch("/api/technologies");

      if (!response.ok) {
        throw new Error(`Failed to fetch technologies: ${response.status}`);
      }

      const data = await response.json();

      // Update state with fetched data
      setTechnologies(data);

      // Update cache
      const cacheData: Cache = {
        data,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem("technologiesCache", JSON.stringify(cacheData));

      return data;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("An unknown error occurred");
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to add a new technology
  const addTechnology = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch("/api/technologies", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add technology");
      }

      const newTechnology = await response.json();

      // Update local state
      setTechnologies((prev) => [...prev, newTechnology]);

      // Invalidate cache
      localStorage.removeItem("technologiesCache");

      return newTechnology;
    } catch (err) {
      throw err;
    }
  }, []);

  // Function to update an existing technology
  const updateTechnology = useCallback(
    async (id: number, formData: FormData) => {
      try {
        const response = await fetch(`/api/technologies/${id}`, {
          method: "PUT",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update technology");
        }

        const updatedTechnology = await response.json();

        // Update local state
        setTechnologies((prev) =>
          prev.map((tech) => (tech.id === id ? updatedTechnology : tech))
        );

        // Invalidate cache
        localStorage.removeItem("technologiesCache");

        return updatedTechnology;
      } catch (err) {
        throw err;
      }
    },
    []
  );

  // Function to delete a technology
  const deleteTechnology = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/technologies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete technology");
      }

      // Update local state
      setTechnologies((prev) => prev.filter((tech) => tech.id !== id));

      // Invalidate cache
      localStorage.removeItem("technologiesCache");

      return true;
    } catch (err) {
      throw err;
    }
  }, []);

  // Function to refresh technologies (force fetch)
  const refreshTechnologies = useCallback(() => {
    return fetchTechnologies(true);
  }, [fetchTechnologies]);

  // Initial fetch on component mount
  useEffect(() => {
    fetchTechnologies();
  }, [fetchTechnologies]);

  // Get all available categories
  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    technologies.forEach((tech) => categories.add(tech.category));
    return Array.from(categories).sort();
  }, [technologies]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    technologies.forEach((tech) => {
      stats[tech.category] = (stats[tech.category] || 0) + 1;
    });
    return stats;
  }, [technologies]);

  // Filter and sort technologies
  const processedTechnologies = useMemo(() => {
    // First filter
    const result = technologies.filter((tech) => {
      const matchesSearch =
        tech.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 ||
        selectedCategories.includes(tech.category);
      return matchesSearch && matchesCategory;
    });

    // Then sort
    return result.sort((a, b) => {
      let comparison = 0;

      if (sortField === "name") {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === "id") {
        comparison = a.id - b.id;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [technologies, searchQuery, selectedCategories, sortField, sortDirection]);

  // Group technologies by category
  const groupedTechnologies = useMemo(() => {
    return processedTechnologies.reduce(
      (acc: Record<string, Technology[]>, tech) => {
        if (!acc[tech.category]) {
          acc[tech.category] = [];
        }
        acc[tech.category].push(tech);
        return acc;
      },
      {}
    );
  }, [processedTechnologies]);

  const categories = Object.keys(groupedTechnologies).sort();
  const [activeTab, setActiveTab] = useState("All");

  // Update active tab when categories change
  useEffect(() => {
    if (activeTab !== "All" && !categories.includes(activeTab)) {
      setActiveTab("All");
    }
  }, [categories, activeTab]);

  // Get technologies for the active tab
  const activeTechnologies = useMemo(() => {
    if (activeTab === "All") {
      return processedTechnologies;
    }
    return groupedTechnologies[activeTab] || [];
  }, [activeTab, processedTechnologies, groupedTechnologies]);

  const handleEdit = (technology: Technology) => {
    setEditingTechnology(technology);
    setFormData({
      name: technology.name,
      category: technology.category,
      icon: null,
    });
    setIsAddTechnologyOpen(true);
  };

  const handleDelete = (technology: Technology) => {
    setDeletingTechnology(technology);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingTechnology) return;

    try {
      await deleteTechnology(deletingTechnology.id);
      toast({
        title: "Technology deleted",
        description: `${deletingTechnology.name} has been removed successfully.`,
      });
      setIsDeleteDialogOpen(false);
      setDeletingTechnology(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete technology. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!formData.name.trim()) {
      setFormError("Technology name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("category", formData.category);

      if (formData.icon) {
        formDataToSend.append("icon", formData.icon);
      }

      if (editingTechnology) {
        await updateTechnology(editingTechnology.id, formDataToSend);
        toast({
          title: "Technology updated",
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        await addTechnology(formDataToSend);
        toast({
          title: "Technology added",
          description: `${formData.name} has been added successfully.`,
        });
      }

      setIsAddTechnologyOpen(false);
      setEditingTechnology(null);
      setFormData({
        name: "",
        category: "Frontend",
        icon: null,
      });
      router.refresh();
    } catch (error: any) {
      setFormError(error.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "Frontend",
      icon: null,
    });
    setFormError("");
  };

  const handleOpenAddDialog = () => {
    setEditingTechnology(null);
    resetForm();
    setIsAddTechnologyOpen(true);
  };

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSortField("name");
    setSortDirection("asc");
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(technologies, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;

    const exportFileDefaultName = `technologies-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    setIsExportDialogOpen(false);

    toast({
      title: "Export successful",
      description: `${technologies.length} technologies exported to ${exportFileDefaultName}`,
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Error Loading Technologies
          </AlertTitle>
          <AlertDescription className="mt-2">
            We encountered a problem while loading your technologies. This could
            be due to network issues or server problems.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTechnologies}
              className="w-full"
            >
              Try Again
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-8 py-4 ">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl font-bold">Technologies</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-full md:w-[200px] lg:w-[300px]"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Filter</span>
                  {selectedCategories.length > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 rounded-sm px-1 font-normal"
                    >
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filter Technologies</SheetTitle>
                  <SheetDescription>
                    Refine your technology list by applying filters
                  </SheetDescription>
                </SheetHeader>
                <div className="py-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Categories</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {allCategories.map((category) => (
                          <div
                            key={category}
                            className={cn(
                              "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                              selectedCategories.includes(category)
                                ? "border-primary bg-primary/5"
                                : "border-input"
                            )}
                            onClick={() => toggleCategoryFilter(category)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{category}</span>
                              <Badge variant="outline" className="ml-auto">
                                {categoryStats[category] || 0}
                              </Badge>
                            </div>
                            {selectedCategories.includes(category) && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">Sort By</h3>
                      <div className="grid grid-cols-1 gap-2">
                        <div
                          className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                            sortField === "name"
                              ? "border-primary bg-primary/5"
                              : "border-input"
                          )}
                          onClick={() => toggleSort("name")}
                        >
                          <span>Name</span>
                          {sortField === "name" && (
                            <ArrowUpDown className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                            sortField === "category"
                              ? "border-primary bg-primary/5"
                              : "border-input"
                          )}
                          onClick={() => toggleSort("category")}
                        >
                          <span>Category</span>
                          {sortField === "category" && (
                            <ArrowUpDown className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div
                          className={cn(
                            "flex items-center justify-between rounded-md border px-3 py-2 text-sm",
                            sortField === "id"
                              ? "border-primary bg-primary/5"
                              : "border-input"
                          )}
                          onClick={() => toggleSort("id")}
                        >
                          <span>Date Added</span>
                          {sortField === "id" && (
                            <ArrowUpDown className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Display Options
                      </h3>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-badges">
                            Show category badges
                          </Label>
                          <Switch
                            id="show-badges"
                            checked={showCategoryBadges}
                            onCheckedChange={setShowCategoryBadges}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between mt-2">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Reset Filters
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      document.dispatchEvent(new Event("close-sheet"))
                    }
                  >
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setViewMode("grid")}
                  className="gap-2"
                >
                  <Grid className="h-4 w-4" />
                  <span>Grid View</span>
                  {viewMode === "grid" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewMode("list")}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  <span>List View</span>
                  {viewMode === "list" && <Check className="h-4 w-4 ml-auto" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setViewMode("compact")}
                  className="gap-2"
                >
                  <Layers className="h-4 w-4" />
                  <span>Compact View</span>
                  {viewMode === "compact" && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Settings className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleOpenAddDialog}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Technology</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsImportDialogOpen(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Import Technologies</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsExportDialogOpen(true)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Technologies</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={refreshTechnologies}
                  className="gap-2"
                >
                  <ArrowUpDown className="h-4 w-4" />
                  <span>Refresh Data</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats overview */}
        {!isLoading && technologies.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{technologies.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Across {allCategories.length} categories
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Top Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                {allCategories.length > 0 && (
                  <>
                    <div className="text-2xl font-bold">
                      {
                        Object.entries(categoryStats).sort(
                          (a, b) => b[1] - a[1]
                        )[0][0]
                      }
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {
                        Object.entries(categoryStats).sort(
                          (a, b) => b[1] - a[1]
                        )[0][1]
                      }{" "}
                      technologies
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2">
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{category}</span>
                          <span className="text-muted-foreground">
                            {count} (
                            {Math.round((count / technologies.length) * 100)}%)
                          </span>
                        </div>
                        <Progress
                          value={(count / technologies.length) * 100}
                          className="h-1"
                        />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Active filters display */}
        {(selectedCategories.length > 0 || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-2 rounded-md">
            <span className="text-sm font-medium text-muted-foreground">
              Active filters:
            </span>
            {selectedCategories.map((category) => (
              <Badge key={category} variant="secondary" className="gap-1">
                {category}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 ml-1 p-0 hover:bg-transparent"
                  onClick={() => toggleCategoryFilter(category)}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove {category} filter</span>
                </Button>
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-3 w-3 ml-1 p-0 hover:bg-transparent"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Clear search</span>
                </Button>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-7 text-xs"
              onClick={clearFilters}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Main content */}
        {isLoading ? (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div
                    className={cn(
                      "flex items-center gap-3",
                      viewMode === "list"
                        ? "justify-between"
                        : "flex-col sm:flex-row"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                {viewMode === "list" && (
                  <CardContent>
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        ) : processedTechnologies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/20 rounded-lg border border-dashed">
            <div className="rounded-full bg-primary/10 p-3 mb-4">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium">No technologies found</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">
              {searchQuery || selectedCategories.length > 0
                ? "No technologies match your current filters. Try adjusting your search criteria."
                : "Your technology catalog is empty. Add your first technology to get started."}
            </p>
            {searchQuery || selectedCategories.length > 0 ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={handleOpenAddDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Technology
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Tabs for category navigation */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <div className="border-b">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-10 bg-transparent p-0">
                    <TabsTrigger
                      value="All"
                      className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                    >
                      All ({processedTechnologies.length})
                    </TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger
                        key={category}
                        value={category}
                        className="rounded-none border-b-2 border-transparent px-4 py-2 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground"
                      >
                        {category} ({groupedTechnologies[category].length})
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </ScrollArea>
              </div>

              {/* All technologies tab */}
              <TabsContent value="All" className="pt-6">
                <div
                  className={cn(
                    viewMode === "grid"
                      ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                      : viewMode === "compact"
                      ? "grid gap-2 grid-cols-1"
                      : "flex flex-col gap-3"
                  )}
                >
                  {renderTechnologies(activeTechnologies, viewMode)}
                </div>
              </TabsContent>

              {/* Category-specific tabs */}
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="pt-6">
                  <div
                    className={cn(
                      viewMode === "grid"
                        ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                        : viewMode === "compact"
                        ? "grid gap-2 grid-cols-1"
                        : "flex flex-col gap-3"
                    )}
                  >
                    {renderTechnologies(
                      groupedTechnologies[category],
                      viewMode
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Add/Edit Technology Dialog */}
        <Dialog
          open={isAddTechnologyOpen}
          onOpenChange={(open) => {
            if (!open) resetForm();
            setIsAddTechnologyOpen(open);
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTechnology ? "Edit Technology" : "Add New Technology"}
              </DialogTitle>
              <DialogDescription>
                {editingTechnology
                  ? "Update the details for this technology in your catalog."
                  : "Add a new technology to your catalog with relevant details."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFormSubmit}>
              <div className="grid gap-4 py-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="technology-name">Technology Name</Label>
                  <Input
                    id="technology-name"
                    placeholder="e.g. React"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="technology-category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger id="technology-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Frontend">Frontend</SelectItem>
                      <SelectItem value="Backend">Backend</SelectItem>
                      <SelectItem value="Mobile Development">
                        Mobile Development
                      </SelectItem>
                      <SelectItem value="AI & Machine Learning">
                        AI & Machine Learning
                      </SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Database">Database</SelectItem>
                      <SelectItem value="IoT">IoT</SelectItem>
                      <SelectItem value="UI/UX Design">UI/UX Design</SelectItem>
                      <SelectItem value="Scientific Computing">
                        Scientific Computing
                      </SelectItem>
                      <SelectItem value="Programming Languages">
                        Programming Languages
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="technology-icon">Icon</Label>
                  <div className="flex items-center gap-4">
                    {editingTechnology &&
                      editingTechnology.icon &&
                      !formData.icon && (
                        <div className="h-12 w-12 rounded-md border flex items-center justify-center overflow-hidden bg-muted">
                          <Image
                            src={editingTechnology.icon || "/placeholder.svg"}
                            alt={editingTechnology.name}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                      )}
                    <div className="flex-1">
                      <Input
                        id="technology-icon"
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setFormData({ ...formData, icon: file });
                        }}
                      />
                      {editingTechnology && !formData.icon && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Leave empty to keep the current icon.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddTechnologyOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Processing..."
                    : editingTechnology
                    ? "Update Technology"
                    : "Add Technology"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Technology</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {deletingTechnology?.name}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Export Dialog */}
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Export Technologies</DialogTitle>
              <DialogDescription>
                Export your technology catalog as a JSON file that can be
                imported later.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="rounded-md bg-muted p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Technology Catalog</p>
                    <p className="text-sm text-muted-foreground">
                      {technologies.length} technologies
                    </p>
                  </div>
                  <Badge variant="outline">.json</Badge>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsExportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  function renderTechnologies(technologies: Technology[], mode: ViewMode) {
    if (mode === "grid") {
      return technologies.map((technology) => (
        <Card
          key={technology.id}
          className="overflow-hidden hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex items-center justify-center rounded-md bg-primary/5 overflow-hidden border">
                  {technology.icon ? (
                    <Image
                      src={technology.icon || "/placeholder.svg"}
                      alt={technology.name}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <Layers className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base font-medium">
                    {technology.name}
                  </CardTitle>
                  {showCategoryBadges && (
                    <Badge variant="outline" className="mt-1">
                      {technology.category}
                    </Badge>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(technology)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => handleDelete(technology)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
        </Card>
      ));
    } else if (mode === "compact") {
      return technologies.map((technology) => (
        <div
          key={technology.id}
          className="flex items-center justify-between p-2 rounded-md border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/5 overflow-hidden border">
              {technology.icon ? (
                <Image
                  src={technology.icon || "/placeholder.svg"}
                  alt={technology.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              ) : (
                <Layers className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{technology.name}</span>
              {showCategoryBadges && (
                <Badge variant="outline" className="text-xs">
                  {technology.category}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(technology)}
              className="h-7 w-7"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(technology)}
              className="h-7 w-7 text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      ));
    } else {
      return technologies.map((technology) => (
        <Card key={technology.id} className="hover:shadow-md transition-shadow">
          <div className="flex items-center p-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-md bg-primary/5 overflow-hidden border mr-4">
              {technology.icon ? (
                <Image
                  src={technology.icon || "/placeholder.svg"}
                  alt={technology.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <Layers className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{technology.name}</h3>
              {showCategoryBadges && (
                <Badge variant="outline" className="mt-1">
                  {technology.category}
                </Badge>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(technology)}
                className="h-8"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(technology)}
                className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ));
    }
  }
}
