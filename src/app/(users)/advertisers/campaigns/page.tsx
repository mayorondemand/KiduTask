"use client";

import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { Navbar } from "@/components/layout/navbar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdvertiserCampaigns } from "@/lib/client";
import type { CampaignFilters, CampaignQuery } from "@/lib/types";
import { cn, formatCurrency, getStatusColor } from "@/lib/utils";
import { useDebounce } from "@uidotdev/usehooks";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Search,
  Users,
  WifiOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

export default function CampaignsPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<CampaignFilters["sortBy"]>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  // Build query parameters with proper typing
  const queryParams = useMemo(
    (): CampaignQuery => ({
      page: currentPage,
      limit,
      search: searchTerm || undefined,
      status:
        statusFilter !== "all"
          ? (statusFilter as "pending" | "approved" | "rejected")
          : undefined,
      activity:
        activityFilter !== "all"
          ? (activityFilter as "active" | "paused" | "ended")
          : undefined,
      sortBy,
      sortOrder,
    }),
    [
      currentPage,
      limit,
      searchTerm,
      statusFilter,
      activityFilter,
      sortBy,
      sortOrder,
    ],
  );

  const {
    data: campaignsData,
    isLoading,
    error,
    refetch,
    isError,
  } = useAdvertiserCampaigns(queryParams);
  const campaigns = campaignsData || [];
  const totalCount = campaignsData?.length || 0;

  const handleRetry = async () => {
    await refetch();
  };
  // Reset page when needed
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Show loading toast for long operations
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        toast.info("Loading campaigns... This might take a moment", {
          duration: 3000,
        });
      }, 2000);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field as CampaignFilters["sortBy"]);
      setSortOrder("desc");
    }
  };

  const SortButton = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className={cn(
        "h-auto hover:text-primary p-0 font-normal",
        sortBy === field && "text-primary font-semibold",
      )}
    >
      {children}
      {sortOrder === "asc" ? (
        <ChevronUp
          className={cn("h-3 w-3", sortBy === field && "text-primary")}
        />
      ) : (
        <ChevronDown
          className={cn("h-3 w-3", sortBy === field && "text-primary")}
        />
      )}
    </Button>
  );

  return (
    <div className="min-h-screen pt-20 bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <BreadcrumbResponsive />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your advertising campaigns
            </p>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <Link href="/advertisers/campaigns/new">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Overview */}

        {/* Filters */}
        <Card className="mb-6 shadow-none">
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activityFilter} onValueChange={setActivityFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="flex items-center gap-2">
              {error?.message?.includes("network") ||
              error?.message?.includes("fetch") ? (
                <>
                  <WifiOff className="h-4 w-4" />
                  Connection Error
                </>
              ) : (
                "Error Loading Campaigns"
              )}
            </AlertTitle>
            <AlertDescription className="mt-2">
              <div className="mb-4">
                {error?.message?.includes("network") ||
                error?.message?.includes("fetch")
                  ? "Unable to connect to the server. Please check your internet connection and try again."
                  : error instanceof Error
                    ? error.message
                    : "Something went wrong while loading your campaigns. Please try again."}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="bg-background"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="bg-background"
                >
                  Reload Page
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Campaigns Table */}
        {!isError && (
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead colSpan={4}>
                      <SortButton field="title">Campaign</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="status">Status</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="activity">Activity</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="totalSubmissions">
                        Submissions
                      </SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="totalCost">Spent</SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton field="createdAt">Created</SortButton>
                    </TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!isLoading
                    ? campaigns.map((campaign) => (
                        <TableRow
                          onClick={() => {
                            router.push(
                              `/advertisers/campaigns/${campaign.id}`,
                            );
                          }}
                          key={campaign.id}
                          className="cursor-pointer hover:bg-muted"
                        >
                          <TableCell colSpan={4}>
                            <div className="flex flex-col gap-2">
                              <div className="font-medium">
                                {campaign.title}
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {campaign.description}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getStatusColor(campaign.activity)}
                            >
                              {campaign.activity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {campaign.totalSubmissions}/{campaign.maxUsers}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {formatCurrency(campaign.totalCost)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                campaign.createdAt,
                              ).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full">
                              <div className="flex justify-between text-xs mb-1">
                                <span>Progress</span>
                                <span>
                                  {campaign.totalSubmissions > 0
                                    ? Math.round(
                                        (campaign.approvedSubmissions /
                                          campaign.maxUsers) *
                                          100,
                                      )
                                    : 0}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  campaign.totalSubmissions > 0
                                    ? (campaign.approvedSubmissions /
                                        campaign.maxUsers) *
                                      100
                                    : 0
                                }
                                className="h-2"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    : Array.from({ length: 5 }).map((_, i) => (
                        // biome-ignore lint/suspicious/noArrayIndexKey: <No data in the map>
                        <TableRow key={i}>
                          <TableCell colSpan={4}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && campaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <BarChart3 className="h-10 w-10 text-primary" />
              </div>

              {searchTerm ||
              statusFilter !== "all" ||
              activityFilter !== "all" ? (
                // Filtered empty state
                <>
                  <h3 className="text-xl font-semibold mb-3">
                    No campaigns match your filters
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    We couldn&apos;t find any campaigns matching your current
                    search and filter criteria. Try adjusting your filters or
                    search terms to see more results.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchInput("");
                        setStatusFilter("all");
                        setActivityFilter("all");
                        toast.success("Filters cleared");
                      }}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Clear Filters
                    </Button>
                    <Link href="/advertisers/campaigns/new">
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Campaign
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                // No campaigns at all
                <div className="flex flex-col items-center justify-center">
                  <h3 className="text-xl font-semibold mb-3">
                    Welcome to Campaign Management!
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    You haven&apos;t created any campaigns yet. Start by
                    creating your first campaign to reach your target audience
                    and grow your business.
                  </p>
                  <Link className="mx-auto" href="/advertisers/campaigns/new">
                    <Button size="lg" className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      Create Your First Campaign
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && !error && campaigns.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * limit + 1} to{" "}
              {Math.min(currentPage * limit, totalCount)} of {totalCount}{" "}
              campaigns
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={campaigns.length < limit}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
