"use client";

import { CampaignCard, CampaignSkeleton } from "@/components/campaign-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { usePublicCampaigns } from "@/lib/client";
import type { CampaignFilters, CampaignWithCounts } from "@/lib/types";
import { useDebounce } from "@uidotdev/usehooks";
import { Bookmark, Loader2, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";

// Filter badge component for active filters
function FilterBadge({
  label,
  value,
  onRemove,
}: {
  label: string;
  value: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
      <span className="text-xs font-medium">{label}:</span>
      <span className="text-xs">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

// Component that wraps useSearchParams in a Suspense boundary
function CampaignsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Separate input state for debouncing
  const [minPayout, setMinPayout] = useState<string>(""); // Empty means no minimum
  const [maxPayout, setMaxPayout] = useState<string>(""); // Empty means no maximum
  const [sortBy, setSortBy] = useState<CampaignFilters["sortBy"] | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [isSearching, setIsSearching] = useState(false);

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const search = searchParams.get("search");
    const minPayout = searchParams.get("minPayout");
    const maxPayout = searchParams.get("maxPayout");
    const sort = searchParams.get("sortBy");
    const order = searchParams.get("sortOrder");
    const page = searchParams.get("page");

    if (search) {
      setSearchQuery(search);
      setSearchInput(search);
    }

    if (minPayout) {
      setMinPayout(minPayout);
    }
    if (maxPayout) {
      setMaxPayout(maxPayout);
    }
    if (sort) {
      setSortBy(sort as CampaignFilters["sortBy"]);
    }
    if (order && ["asc", "desc"].includes(order)) {
      setSortOrder(order as "asc" | "desc");
    }
    if (page) {
      setCurrentPage(Number(page));
    }
  }, [searchParams]);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchInput, 1000);

  // Debounced payout inputs
  const debouncedMinPayout = useDebounce(minPayout, 1000);
  const debouncedMaxPayout = useDebounce(maxPayout, 1000);

  // Update search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
    setCurrentPage(1);
    setIsSearching(false);
  }, [debouncedSearchQuery]);

  // Reset to page 1 when payout filters change
  useEffect(() => {
    if (debouncedMinPayout || debouncedMaxPayout) {
      setCurrentPage(1);
    }
  }, [debouncedMinPayout, debouncedMaxPayout]);

  // Handle search input changes
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setIsSearching(value !== searchQuery);
    },
    [searchQuery],
  );

  // Build the query parameters
  const queryParams: CampaignFilters = useMemo(() => {
    const params: CampaignFilters = {
      page: currentPage,
      limit: 12,
      status: "approved",
      activity: "active",
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (debouncedMinPayout && Number(debouncedMinPayout))
      params.minPayout = Number(debouncedMinPayout);
    if (debouncedMaxPayout && Number(debouncedMaxPayout))
      params.maxPayout = Number(debouncedMaxPayout);
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    return params;
  }, [
    currentPage,
    searchQuery,
    debouncedMinPayout,
    debouncedMaxPayout,
    sortBy,
    sortOrder,
  ]);

  const { data: campaigns, isLoading } = usePublicCampaigns(queryParams);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setMinPayout("");
    setMaxPayout("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    setIsSearching(false);
    router.push(""); // Clear URL params
  };

  // Update URL with current filter state
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (minPayout) params.set("minPayout", minPayout);
    if (maxPayout) params.set("maxPayout", maxPayout);
    if (sortBy && sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder && sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(newUrl, { scroll: false });
  }, [
    searchQuery,
    minPayout,
    maxPayout,
    sortBy,
    sortOrder,
    currentPage,
    router,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  const activeFiltersCount = [searchQuery, minPayout, maxPayout].filter(
    Boolean,
  ).length;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Campaigns
          </h1>
          <p className="text-gray-600">
            Discover and complete tasks to earn money
          </p>
        </div>

        {/* Enhanced Filters */}
        <Card className="mb-8 shadow-sm border-0 bg-white">
          <CardContent className="">
            {/* Filter Presets */}
            <section
              className="mb-6 pb-4 border-b border-gray-100"
              aria-labelledby="filter-presets-title"
            >
              <div className="flex items-center gap-2 mb-1">
                <Bookmark className="h-4 w-4 text-gray-500" />
                <span
                  id="filter-presets-title"
                  className="text-sm font-medium text-gray-700"
                >
                  Filters
                </span>
              </div>
            </section>

            {/* Filters Row */}
            <div className="flex justify-between gap-4 mb-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-gray-400 animate-spin" />
                )}
                <Input
                  placeholder="Search campaigns..."
                  value={searchInput}
                  onChange={(e) => handleSearchInputChange(e.target.value)}
                  className="pl-10 pr-10 border-gray-200 focus:border-primary focus:ring-primary"
                  aria-label="Search campaigns"
                />
              </div>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as CampaignFilters["sortBy"])
                }
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Date Created</SelectItem>
                  <SelectItem value="payoutPerUser">Payout</SelectItem>
                  <SelectItem value="totalSubmissions">
                    Total Submissions
                  </SelectItem>
                  <SelectItem value="approvedSubmissions">
                    Approved Submissions
                  </SelectItem>
                  <SelectItem value="remainingSlots">
                    Remaining Slots
                  </SelectItem>
                  <SelectItem value="completionRate">
                    Completion Rate
                  </SelectItem>
                  <SelectItem value="estimatedTimeMinutes">Duration</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Order */}
              <Select
                value={sortOrder}
                onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Sort Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Highest First</SelectItem>
                  <SelectItem value="asc">Lowest First</SelectItem>
                </SelectContent>
              </Select>

              {/* Min Payout */}
              <Input
                type="number"
                placeholder="₦ Min Pay"
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                className="max-w-32 text-xs"
                min={0}
              />

              {/* Max Payout */}
              <Input
                type="number"
                placeholder="₦ Max Pay"
                value={maxPayout}
                onChange={(e) => setMaxPayout(e.target.value)}
                className="max-w-32 text-xs"
                min={0}
              />
            </div>

            {/* Active Filters Display */}
            {activeFiltersCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-gray-700">
                    Active Filters:
                  </span>
                  {searchQuery && (
                    <FilterBadge
                      label="Search"
                      value={searchQuery}
                      onRemove={() => {
                        setSearchQuery("");
                        setSearchInput("");
                      }}
                    />
                  )}

                  {minPayout && (
                    <FilterBadge
                      label="Min Payout"
                      value={`₦${minPayout}+`}
                      onRemove={() => setMinPayout("")}
                    />
                  )}
                  {maxPayout && (
                    <FilterBadge
                      label="Max Payout"
                      value={`Up to ₦${maxPayout}`}
                      onRemove={() => setMaxPayout("")}
                    />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-gray-500 hover:text-gray-700 ml-2"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${campaigns?.length || 0} campaigns`
            )}
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 12 }, (_, i) => (
                <CampaignSkeleton key={`skeleton-${Date.now()}-${i}`} />
              ))
            : campaigns?.map((campaign: CampaignWithCounts) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
        </div>

        {/* Pagination */}
        {!isLoading && campaigns && campaigns.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!campaigns || campaigns.length < queryParams.limit}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!campaigns || campaigns.length === 0) && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <Search className="h-20 w-20 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeFiltersCount > 0
                ? "Try adjusting your search or filter criteria to find more campaigns."
                : "No campaigns are currently available. Check back later for new opportunities."}
            </p>
            {activeFiltersCount > 0 && (
              <Button onClick={clearAllFilters} variant="outline">
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <CampaignsPageContent />
    </Suspense>
  );
}
