import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/navbar";
import { ProjectCard, ProjectCardSkeleton } from "@/components/project-card";
import { ProjectFiltersCard, ProjectFiltersInline } from "@/components/project-filters";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  Grid, 
  List as ListIcon, 
  SlidersHorizontal,
  FileSearch,
  PlusCircle
} from "lucide-react";
import { Link } from "wouter";
import type { RwaProjectWithAnalysis, ProjectFilters } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplorePage() {
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const { data: projects, isLoading } = useQuery<RwaProjectWithAnalysis[]>({
    queryKey: ["/api/projects", filters],
  });

  const filteredProjects = projects?.filter(project => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!project.name.toLowerCase().includes(query) && 
          !project.description.toLowerCase().includes(query) &&
          !project.tokenSymbol.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    if (filters.assetType && project.assetType !== filters.assetType) {
      return false;
    }
    
    if (filters.riskLevel && project.riskAnalysis?.riskLevel !== filters.riskLevel) {
      return false;
    }
    
    if (filters.minYield && project.yieldPercentage < filters.minYield) {
      return false;
    }
    
    if (filters.minScore && (project.riskAnalysis?.overallScore || 0) < filters.minScore) {
      return false;
    }
    
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Explore Projects</h1>
          <p className="text-muted-foreground">
            Browse and filter analyzed RWA projects
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-projects"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
              data-testid="button-toggle-filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`rounded-r-none ${viewMode === "grid" ? "bg-accent" : ""}`}
                data-testid="button-view-grid"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className={`rounded-l-none ${viewMode === "list" ? "bg-accent" : ""}`}
                data-testid="button-view-list"
              >
                <ListIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Inline Filters (always visible on larger screens) */}
        <div className="hidden lg:block mb-6">
          <ProjectFiltersInline filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Sidebar Filters (visible when showFilters is true or on large screens) */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-64 shrink-0 lg:hidden"
              >
                <ProjectFiltersCard filters={filters} onFiltersChange={setFilters} />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Projects Grid/List */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredProjects.length} project{filteredProjects.length !== 1 ? "s" : ""} found
              </p>
            </div>

            {isLoading ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
                {filteredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} />
                ))}
              </div>
            ) : (
              <Card className="border-card-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="py-16">
                  <div className="text-center">
                    <FileSearch className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">No projects found</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      {searchQuery || Object.keys(filters).length > 0
                        ? "Try adjusting your search or filters to find more projects."
                        : "Be the first to submit an RWA project for analysis."}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      {(searchQuery || Object.keys(filters).length > 0) && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchQuery("");
                            setFilters({});
                          }}
                          data-testid="button-clear-all-filters"
                        >
                          Clear Filters
                        </Button>
                      )}
                      <Link href="/submit">
                        <Button data-testid="button-submit-new-project">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Submit Project
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
