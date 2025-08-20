"use client";

import { CampaignCard, CampaignSkeleton } from "@/components/campaign-card";
import { Navbar } from "@/components/layout/navbar";
import { useAuth } from "@/components/providers/auth-provider";
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
import { useCampaigns } from "@/lib/client";
import type {
  ActivityEnum,
  CampaignQuery,
  CampaignWithCounts,
  StatusEnum,
} from "@/lib/types";
import { useDebounce } from "@uidotdev/usehooks";
import {
  Bookmark,
  ChevronDown,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// Range slider component for payout filtering
function PayoutRangeSlider({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (newMin: number) => {
    const clampedMin = Math.max(min, Math.min(newMin, localValue[1] - 50));
    const newValue: [number, number] = [clampedMin, localValue[1]];
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (newMax: number) => {
    const clampedMax = Math.min(max, Math.max(newMax, localValue[0] + 50));
    const newValue: [number, number] = [localValue[0], clampedMax];
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>₦{localValue[0]}</span>
        <span>₦{localValue[1]}</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${((localValue[0] - min) / (max - min)) * 100}%`,
            width: `${((localValue[1] - localValue[0]) / (max - min)) * 100}%`,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={localValue[0]}
          onChange={(e) => handleMinChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          aria-label="Minimum payout"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={50}
          value={localValue[1]}
          onChange={(e) => handleMaxChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          aria-label="Maximum payout"
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={localValue[0] === min ? "" : localValue[0]}
          onChange={(e) => {
            const value = e.target.value === "" ? min : Number(e.target.value);
            handleMinChange(value);
          }}
          className="text-xs h-8"
          min={min}
          max={max}
        />
        <Input
          type="number"
          placeholder="Max"
          value={localValue[1] === max ? "" : localValue[1]}
          onChange={(e) => {
            const value = e.target.value === "" ? max : Number(e.target.value);
            handleMaxChange(value);
          }}
          className="text-xs h-8"
          min={min}
          max={max}
        />
      </div>
    </div>
  );
}

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

export default function CampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState(""); // Separate input state for debouncing
  const [statusFilter, setStatusFilter] = useState<StatusEnum | "">("");
  const [activityFilter, setActivityFilter] = useState<ActivityEnum | "">("");
  const [payoutRange, setPayoutRange] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [sortBy, setSortBy] = useState<CampaignQuery["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [advancedPayoutRange, setAdvancedPayoutRange] = useState<
    [number, number]
  >([100, 1000]);

  // Initialize state from URL parameters on mount
  useEffect(() => {
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const activity = searchParams.get("activity");
    const minPayout = searchParams.get("minPayout");
    const maxPayout = searchParams.get("maxPayout");
    const sort = searchParams.get("sortBy");
    const order = searchParams.get("sortOrder");
    const page = searchParams.get("page");

    if (search) {
      setSearchQuery(search);
      setSearchInput(search);
    }
    if (status) {
      setStatusFilter(status as StatusEnum);
    }
    if (activity) {
      setActivityFilter(activity as ActivityEnum);
    }
    if (minPayout || maxPayout) {
      const range = {
        min: minPayout ? Number(minPayout) : undefined,
        max: maxPayout ? Number(maxPayout) : undefined,
      };
      setPayoutRange(range);
      if (range.min && range.max) {
        setAdvancedPayoutRange([range.min, range.max]);
      }
    }
    if (sort) {
      setSortBy(sort as CampaignQuery["sortBy"]);
    }
    if (order && ["asc", "desc"].includes(order)) {
      setSortOrder(order as "asc" | "desc");
    }
    if (page) {
      setCurrentPage(Number(page));
    }
  }, [searchParams]);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  // Update search query when debounced value changes
  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
    setCurrentPage(1);
    setIsSearching(false);
  }, [debouncedSearchQuery]);

  // Handle search input changes
  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      setIsSearching(value !== searchQuery);
    },
    [searchQuery],
  );

  // Build the query parameters
  const queryParams: Partial<CampaignQuery> &
    Pick<CampaignQuery, "page" | "limit"> = useMemo(() => {
    const params: Partial<CampaignQuery> &
      Pick<CampaignQuery, "page" | "limit"> = {
      page: currentPage,
      limit: 12,
    };

    if (searchQuery.trim()) params.search = searchQuery.trim();
    if (statusFilter) params.status = statusFilter;
    if (activityFilter) params.activity = activityFilter;
    if (payoutRange.min !== undefined) params.minPayout = payoutRange.min;
    if (payoutRange.max !== undefined) params.maxPayout = payoutRange.max;
    if (sortBy) params.sortBy = sortBy;
    if (sortOrder) params.sortOrder = sortOrder;

    return params;
  }, [
    currentPage,
    searchQuery,
    statusFilter,
    activityFilter,
    payoutRange,
    sortBy,
    sortOrder,
  ]);

  const { data: campaigns, isLoading } = useCampaigns(queryParams);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchInput("");
    setStatusFilter("");
    setActivityFilter("");
    setPayoutRange({});
    setAdvancedPayoutRange([100, 1000]);
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    setIsSearching(false);
    router.replace("", { scroll: false }); // Clear URL params
  };

  const handleAdvancedPayoutRangeChange = useCallback(
    (range: [number, number]) => {
      setAdvancedPayoutRange(range);
      setPayoutRange({ min: range[0], max: range[1] });
      setCurrentPage(1);
    },
    [],
  );

  // Update URL with current filter state
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter) params.set("status", statusFilter);
    if (activityFilter) params.set("activity", activityFilter);
    if (payoutRange.min) params.set("minPayout", payoutRange.min.toString());
    if (payoutRange.max) params.set("maxPayout", payoutRange.max.toString());
    if (sortBy && sortBy !== "createdAt") params.set("sortBy", sortBy);
    if (sortOrder && sortOrder !== "desc") params.set("sortOrder", sortOrder);
    if (currentPage > 1) params.set("page", currentPage.toString());

    const newUrl = params.toString() ? `?${params.toString()}` : "";
    router.replace(newUrl, { scroll: false });
  }, [
    searchQuery,
    statusFilter,
    activityFilter,
    payoutRange,
    sortBy,
    sortOrder,
    currentPage,
    router,
  ]);

  // Update URL when filters change
  useEffect(() => {
    updateUrlParams();
  }, [updateUrlParams]);

  const activeFiltersCount = [
    searchQuery,
    statusFilter,
    activityFilter,
    payoutRange.min !== undefined || payoutRange.max !== undefined,
  ].filter(Boolean).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
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

            {/* Primary Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
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

              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as StatusEnum);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="border-gray-200"
                  aria-label="Filter by status"
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={activityFilter}
                onValueChange={(value) => {
                  setActivityFilter(value as ActivityEnum);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger
                  className="border-gray-200"
                  aria-label="Filter by activity status"
                >
                  <SelectValue placeholder="Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
                className="border-gray-200 hover:bg-gray-50 relative"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Advanced
                {activeFiltersCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs bg-primary">
                    {activeFiltersCount}
                  </Badge>
                )}
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${showMoreFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Advanced Filters (Collapsible) */}
            {showMoreFilters && (
              <div className="pt-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="sort-by"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) =>
                        setSortBy(value as CampaignQuery["sortBy"])
                      }
                    >
                      <SelectTrigger id="sort-by" className="border-gray-200">
                        <SelectValue />
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
                        <SelectItem value="estimatedTimeMinutes">
                          Duration
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="sort-order"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Sort Order
                    </label>
                    <Select
                      value={sortOrder}
                      onValueChange={(value) =>
                        setSortOrder(value as "asc" | "desc")
                      }
                    >
                      <SelectTrigger
                        id="sort-order"
                        className="border-gray-200"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Highest First</SelectItem>
                        <SelectItem value="asc">Lowest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label
                      htmlFor="payout-range-slider"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Custom Payout Range
                    </label>
                    <div id="payout-range-slider">
                      <PayoutRangeSlider
                        min={100}
                        max={1000}
                        value={advancedPayoutRange}
                        onChange={handleAdvancedPayoutRangeChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6">
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="hover:bg-gray-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear All Filters
                  </Button>
                </div>
              </div>
            )}

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
                  {statusFilter && (
                    <FilterBadge
                      label="Status"
                      value={
                        statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)
                      }
                      onRemove={() => setStatusFilter("")}
                    />
                  )}
                  {activityFilter && (
                    <FilterBadge
                      label="Activity"
                      value={
                        activityFilter.charAt(0).toUpperCase() +
                        activityFilter.slice(1)
                      }
                      onRemove={() => setActivityFilter("")}
                    />
                  )}
                  {(payoutRange.min !== undefined ||
                    payoutRange.max !== undefined) && (
                    <FilterBadge
                      label="Payout"
                      value={
                        payoutRange.min && payoutRange.max
                          ? `₦${payoutRange.min} - ₦${payoutRange.max}`
                          : payoutRange.min
                            ? `₦${payoutRange.min}+`
                            : `Up to ₦${payoutRange.max}`
                      }
                      onRemove={() => setPayoutRange({})}
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

          {/* Quick Sort Options */}
          {!isLoading && campaigns && campaigns.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Quick sort:</span>
              <Button
                variant={sortBy === "payoutPerUser" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSortBy("payoutPerUser");
                  setSortOrder(
                    sortBy === "payoutPerUser" && sortOrder === "desc"
                      ? "asc"
                      : "desc",
                  );
                }}
                className="h-8"
              >
                Payout{" "}
                {sortBy === "payoutPerUser" &&
                  (sortOrder === "desc" ? "↓" : "↑")}
              </Button>
              <Button
                variant={sortBy === "remainingSlots" ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  setSortBy("remainingSlots");
                  setSortOrder(
                    sortBy === "remainingSlots" && sortOrder === "desc"
                      ? "asc"
                      : "desc",
                  );
                }}
                className="h-8"
              >
                Slots{" "}
                {sortBy === "remainingSlots" &&
                  (sortOrder === "desc" ? "↓" : "↑")}
              </Button>
            </div>
          )}
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
