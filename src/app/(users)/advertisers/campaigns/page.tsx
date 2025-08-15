"use client";

import { Navbar } from "@/components/layout/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useCampaigns } from "@/lib/client";
import type { CampaignQuery } from "@/lib/services/campaign-service";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Eye,
  Filter,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
// Loading skeleton components
const CampaignSkeleton = () => (
  <div className="space-y-3">
    <div className="flex items-center space-x-4">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[100px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
    <div className="flex items-center space-x-4">
      <Skeleton className="h-4 w-[150px]" />
      <Skeleton className="h-4 w-[120px]" />
      <Skeleton className="h-4 w-[100px]" />
    </div>
    <Skeleton className="h-2 w-full" />
  </div>
);

export default function CampaignsPage() {
  const [searchInput, setSearchInput] = useState("");
  const searchTerm = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("createdAt");
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

  const { data: campaignsData, isLoading, error } = useCampaigns(queryParams);
  const campaigns = campaignsData || [];
  const totalCount = campaignsData?.length || 0;
  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, []);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
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
      className="h-auto p-0 font-normal"
    >
      {children}
      {sortBy === field &&
        (sortOrder === "asc" ? (
          <ChevronUp className="ml-1 h-3 w-3" />
        ) : (
          <ChevronDown className="ml-1 h-3 w-3" />
        ))}
    </Button>
  );

  return (
    <div className="min-h-screen pt-20 bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your advertising campaigns
            </p>
          </div>
          <Link href="/advertisers/campaigns/new">
            <Button className="flex items-center gap-2 mt-4 sm:mt-0">
              <Plus className="h-4 w-4" />
              Create New Campaign
            </Button>
          </Link>
        </div>

        {/* Status Overview */}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
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

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <CampaignSkeleton key={i} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-destructive mb-4">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  Error loading campaigns
                </h3>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Something went wrong"}
                </p>
              </div>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Table */}
        {!isLoading && !error && campaigns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
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
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="font-medium">{campaign.title}</div>
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
                          {new Date(campaign.createdAt).toLocaleDateString()}
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
                                      campaign.totalSubmissions) *
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
                                    campaign.totalSubmissions) *
                                  100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/advertisers/campaigns/${campaign.id}`}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {campaign.activity === "active" ? (
                              <DropdownMenuItem>
                                <Pause className="mr-2 h-4 w-4" />
                                Pause Campaign
                              </DropdownMenuItem>
                            ) : campaign.activity === "paused" ? (
                              <DropdownMenuItem>
                                <Play className="mr-2 h-4 w-4" />
                                Resume Campaign
                              </DropdownMenuItem>
                            ) : null}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && campaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchTerm ||
                statusFilter !== "all" ||
                activityFilter !== "all"
                  ? "No campaigns match your current filters. Try adjusting your search or filters."
                  : "You haven't created any campaigns yet. Get started by creating your first campaign!"}
              </p>
              <Link href="/advertisers/campaigns/new">
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Campaign
                </Button>
              </Link>
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
