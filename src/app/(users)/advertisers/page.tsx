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
import { StatsCard } from "@/components/stats-card";
import {
  BarChart3,
  Plus,
  Users,
  DollarSign,
  Eye,
  Settings,
  Calendar,
  Target,
  ArchiveRestore,
  PercentCircle,
  Loader2,
  Check,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { useAdvertiserDashboard, useCampaigns } from "@/lib/client";

export default function AdvertiserDashboard() {
  const { user } = useAuth();
  const { data: mockStats, isLoading: isStatsLoading } = useAdvertiserDashboard();
  const { data: campaigns, isLoading: isCampaignsLoading } = useCampaigns({
    limit: 5,
    page: 1,
  });

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div className="mb-6 lg:mb-0">
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={user?.image || ""}
                  alt={user?.name || "User"}
                />
                <AvatarFallback className="bg-gray-200 text-primary">
                  {user?.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold ">
                  Welcome back, {user?.name.split(" ")[0]}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Here&apos;s your campaign performance overview
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
            <Link href="/advertisers/campaigns">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white border-gray-200 hover:bg-gray-50"
              >
                <Eye className="h-4 w-4" />
                View Campaigns
              </Button>
            </Link>
            <Link href="/advertisers/campaigns/new">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats Row */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
        </div> */}

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatsCard
            className="bg-gradient-to-br from-purple-500 to-purple-600"
            icon={BarChart3}
            title="Active Campaigns"
            value={mockStats?.activeCampaigns ?? 0}
            subtitle={
              mockStats?.pendingApprovals
                ? `${mockStats.pendingApprovals} pending approval`
                : "No pending approvals"
            }
            loading={isStatsLoading}
          />

          <StatsCard
            className="bg-gradient-to-br from-emerald-500 to-emerald-600"
            icon={DollarSign}
            title="Total Spent"
            value={
              mockStats?.totalSpentMonth
                ? formatCurrency(mockStats.totalSpentMonth)
                : formatCurrency(0)
            }
            subtitle="this month"
            loading={isStatsLoading}
          />

          <StatsCard
            className="bg-gradient-to-br from-blue-500 to-blue-600"
            icon={Users}
            title="Total Reach"
            value={mockStats?.totalReach ?? 0}
            subtitle="Unique users reached"
            loading={isStatsLoading}
          />

          <StatsCard
            className="bg-gradient-to-br from-orange-500 to-orange-600"
            icon={Target}
            title="Success Rate"
            value={
              mockStats?.approvalRate ? `${mockStats.approvalRate}%` : "0%"
            }
            subtitle="Task approval rate"
            loading={isStatsLoading}
          />

          <StatsCard
            className="bg-gradient-to-br from-yellow-500 to-yellow-600"
            icon={ArchiveRestore}
            title="Submissions Today"
            value={mockStats?.submissionsToday ?? 0}
            subtitle="Submissions today"
            loading={isStatsLoading}
          />

          <StatsCard
            className="bg-gradient-to-br from-green-500 to-green-600"
            icon={PercentCircle}
            title="Conversion Rate"
            value={
              mockStats?.conversionRate ? `${mockStats.conversionRate}%` : "0%"
            }
            subtitle="Conversion rate"
            loading={isStatsLoading}
          />
        </div>

        {/* <div className="grid lg:grid-cols-3 gap-8 mb-8">
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
        </div> */}

        {/* Recent Campaigns */}
        <Card className="border shadow-none border-gray-100 bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
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
              {isCampaignsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <p className="text-gray-500">Loading campaigns...</p>
                  </div>
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <Link
                    key={campaign.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors group"
                    href={`/advertisers/campaigns/${campaign.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex  items-center gap-3 mb-5">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                          {campaign.title}
                        </h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getStatusColor(campaign.activity)}
                        >
                          {campaign.activity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-5">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {campaign.totalSubmissions}/{campaign.maxUsers}{" "}
                          submissions
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(campaign.totalCost)} spent
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(campaign.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          {campaign.approvedSubmissions}/
                          {campaign.totalSubmissions} approved
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Progress</span>
                            <span className="font-medium text-gray-700">
                              {campaign.approvedSubmissions}/
                              {campaign.totalSubmissions} approved
                            </span>
                          </div>
                          <Progress
                            value={
                              (campaign.approvedSubmissions /
                                campaign.totalSubmissions) *
                              100
                            }
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No campaigns found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md">
                    You haven&apos;t created any campaigns yet, or no campaigns match
                    your current filters. Get started by creating your first
                    campaign!
                  </p>
                  <Link href="/advertisers/campaigns/new">
                    <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                      <Plus className="h-4 w-4" />
                      Create Your First Campaign
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
