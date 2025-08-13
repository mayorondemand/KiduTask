"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Users,
  DollarSign,
  Calendar,
  Search,
  Eye,
  Pause,
  Play,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock campaigns data
const mockCampaigns = [
  {
    id: "1",
    name: "Instagram Follow Campaign",
    status: "active",
    progress: 75,
    submissions: 45,
    maxUsers: 60,
    spent: 6750,
    budget: 9000,
    type: "Social Media",
    createdAt: "2024-01-15",
    pendingSubmissions: 5,
  },
  {
    id: "2",
    name: "App Store Review Campaign",
    status: "completed",
    progress: 100,
    submissions: 100,
    maxUsers: 100,
    spent: 15000,
    budget: 15000,
    type: "App Review",
    createdAt: "2024-01-10",
    pendingSubmissions: 0,
  },
  {
    id: "3",
    name: "YouTube Subscribe & Like",
    status: "pending",
    progress: 0,
    submissions: 0,
    maxUsers: 200,
    spent: 0,
    budget: 30000,
    type: "Social Media",
    createdAt: "2024-01-20",
    pendingSubmissions: 0,
  },
  {
    id: "4",
    name: "Product Survey Campaign",
    status: "active",
    progress: 40,
    submissions: 20,
    maxUsers: 50,
    spent: 3000,
    budget: 7500,
    type: "Survey",
    createdAt: "2024-01-18",
    pendingSubmissions: 3,
  },
  {
    id: "5",
    name: "TikTok Video Creation",
    status: "paused",
    progress: 25,
    submissions: 5,
    maxUsers: 20,
    spent: 750,
    budget: 3000,
    type: "Content Creation",
    createdAt: "2024-01-12",
    pendingSubmissions: 2,
  },
  {
    id: "6",
    name: "LinkedIn Engagement Campaign",
    status: "active",
    progress: 90,
    submissions: 90,
    maxUsers: 100,
    spent: 13500,
    budget: 15000,
    type: "Social Media",
    createdAt: "2024-01-08",
    pendingSubmissions: 8,
  },
];

export default function CampaignsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    if (!user?.isAdvertiser) {
      router.push("/home");
    }
  }, [user, router]);

  if (!user?.isAdvertiser) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paused":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Filter campaigns
  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;
    const matchesType = typeFilter === "all" || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Get stats
  const stats = {
    active: mockCampaigns.filter((c) => c.status === "active").length,
    completed: mockCampaigns.filter((c) => c.status === "completed").length,
    pending: mockCampaigns.filter((c) => c.status === "pending").length,
    paused: mockCampaigns.filter((c) => c.status === "paused").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your advertising campaigns
            </p>
          </div>
          <Link href="/advertisers/campaign/new">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 mt-4 sm:mt-0">
              <Plus className="h-4 w-4" />
              Create New Campaign
            </Button>
          </Link>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.active}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {stats.completed}
              </div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">
                {stats.paused}
              </div>
              <p className="text-sm text-muted-foreground">Paused</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="App Review">App Review</SelectItem>
                  <SelectItem value="Survey">Survey</SelectItem>
                  <SelectItem value="Content Creation">
                    Content Creation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Campaigns Grid */}
        <div className="grid gap-6">
          {filteredCampaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{campaign.name}</h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline">{campaign.type}</Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {campaign.submissions}/{campaign.maxUsers} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(campaign.spent)} /{" "}
                        {formatCurrency(campaign.budget)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created{" "}
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      {campaign.pendingSubmissions > 0 && (
                        <Badge variant="secondary">
                          {campaign.pendingSubmissions} pending review
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{campaign.progress}%</span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/advertisers/campaigns/${campaign.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {campaign.status === "active" ? (
                          <DropdownMenuItem>
                            <Pause className="mr-2 h-4 w-4" />
                            Pause Campaign
                          </DropdownMenuItem>
                        ) : campaign.status === "paused" ? (
                          <DropdownMenuItem>
                            <Play className="mr-2 h-4 w-4" />
                            Resume Campaign
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground mb-4">
                No campaigns found matching your filters.
              </div>
              <Link href="/advertisers/campaign/new">
                <Button>Create Your First Campaign</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
