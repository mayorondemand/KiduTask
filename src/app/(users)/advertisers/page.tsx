"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart3,
  Plus,
  Users,
  DollarSign,
  Eye,
  Settings,
  Calendar,
  Target,
  CheckCircle,
  ArrowUpRight,
  Zap,
  Star,
  Activity,
} from "lucide-react";
import Link from "next/link";

// Mock data for the dashboard
const mockStats = {
  activeCampaigns: 8,
  totalSpent: 127500,
  pendingApprovals: 23,
  totalReach: 45200,
  thisMonthSpent: 32000,
  lastMonthSpent: 24500,
  conversionRate: 4.2,
  avgCostPerTask: 185,
  totalCampaigns: 24,
  approvalRate: 89.5,
};

const mockRecentCampaigns = [
  {
    id: "1",
    name: "Instagram Follow Campaign",
    status: "active",
    progress: 85,
    submissions: 85,
    maxUsers: 100,
    spent: 12750,
    budget: 15000,
    type: "Social Media",
    createdAt: "2024-01-15",
    approvalRate: 92,
  },
  {
    id: "2",
    name: "App Store Review Campaign",
    status: "completed",
    progress: 100,
    submissions: 50,
    maxUsers: 50,
    spent: 25000,
    budget: 25000,
    type: "App Review",
    createdAt: "2024-01-10",
    approvalRate: 96,
  },
  {
    id: "3",
    name: "YouTube Subscribe & Like",
    status: "active",
    progress: 60,
    submissions: 120,
    maxUsers: 200,
    spent: 36000,
    budget: 60000,
    type: "Social Media",
    createdAt: "2024-01-20",
    approvalRate: 88,
  },
];

const mockQuickStats = [
  { label: "Today's Submissions", value: "47", change: "+12%", trend: "up" },
  { label: "Active Users", value: "1,247", change: "+8%", trend: "up" },
  {
    label: "Avg. Completion Time",
    value: "3.2h",
    change: "-15%",
    trend: "down",
  },
  { label: "Success Rate", value: "94.2%", change: "+2%", trend: "up" },
];

export default function AdvertiserDashboard() {
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "paused":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const growthPercentage = (
    ((mockStats.thisMonthSpent - mockStats.lastMonthSpent) /
      mockStats.lastMonthSpent) *
    100
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-4 mb-3">
              <Avatar className="w-12 h-12 ring-2 ring-purple-100">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Here's your campaign performance overview
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/advertisers/brand">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50"
              >
                <Settings className="h-4 w-4" />
                Brand Settings
              </Button>
            </Link>
            <Link href="/advertisers/campaign/new">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {mockQuickStats.map((stat) => (
            <Card
              key={stat.label}
              className="border-0 shadow-sm bg-white/60 backdrop-blur-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    <ArrowUpRight
                      className={`h-3 w-3 ${stat.trend === "down" ? "rotate-90" : ""}`}
                    />
                    {stat.change}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">
                    Active Campaigns
                  </p>
                  <p className="text-3xl font-bold">
                    {mockStats.activeCampaigns}
                  </p>
                  <p className="text-purple-100 text-xs mt-1">
                    {mockStats.pendingApprovals} pending approval
                  </p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Total Spent</p>
                  <p className="text-3xl font-bold">
                    {formatCurrency(mockStats.totalSpent)}
                  </p>
                  <p className="text-emerald-100 text-xs mt-1">
                    +{growthPercentage}% this month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Reach</p>
                  <p className="text-3xl font-bold">
                    {mockStats.totalReach.toLocaleString()}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">
                    Unique users reached
                  </p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm mb-1">Success Rate</p>
                  <p className="text-3xl font-bold">
                    {mockStats.approvalRate}%
                  </p>
                  <p className="text-orange-100 text-xs mt-1">
                    Campaign approval rate
                  </p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Quick Actions */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-purple-600" />
                Quick Actions
              </CardTitle>
              <CardDescription>Get things done faster</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/advertisers/campaign/new">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100"
                >
                  <Plus className="h-4 w-4 mr-3 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Create Campaign
                    </div>
                    <div className="text-xs text-gray-500">
                      Launch a new task campaign
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/advertisers/campaigns">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200 hover:from-blue-100 hover:to-emerald-100"
                >
                  <Eye className="h-4 w-4 mr-3 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      View All Campaigns
                    </div>
                    <div className="text-xs text-gray-500">
                      Manage existing campaigns
                    </div>
                  </div>
                </Button>
              </Link>

              <Link href="/advertisers/brand">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12 bg-gradient-to-r from-emerald-50 to-orange-50 border-emerald-200 hover:from-emerald-100 hover:to-orange-100"
                >
                  <Settings className="h-4 w-4 mr-3 text-emerald-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">
                      Brand Settings
                    </div>
                    <div className="text-xs text-gray-500">
                      Update brand information
                    </div>
                  </div>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Insights */}
          <Card className="lg:col-span-2 border-0 shadow-lg bg-white">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-blue-600" />
                Performance Insights
              </CardTitle>
              <CardDescription>Key metrics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">
                    {mockStats.totalCampaigns}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Total Campaigns
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                  <div className="text-2xl font-bold text-emerald-600">
                    {mockStats.approvalRate}%
                  </div>
                  <div className="text-sm text-emerald-700 mt-1">
                    Approval Rate
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(mockStats.avgCostPerTask)}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    Avg Cost/Task
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">
                    {mockStats.conversionRate}%
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Conversion Rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="border-0 shadow-lg bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-yellow-500" />
                Recent Campaigns
              </CardTitle>
              <CardDescription>
                Your latest campaign activity and performance
              </CardDescription>
            </div>
            <Link href="/advertisers/campaigns">
              <Button variant="outline" size="sm" className="bg-white">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        {campaign.name}
                      </h3>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {campaign.type}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {campaign.submissions}/{campaign.maxUsers} submissions
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatCurrency(campaign.spent)} spent
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3 text-emerald-500" />
                        {campaign.approvalRate}% approved
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium text-gray-700">
                            {campaign.progress}%
                          </span>
                        </div>
                        <Progress value={campaign.progress} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <Link href={`/advertisers/campaigns/${campaign.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
