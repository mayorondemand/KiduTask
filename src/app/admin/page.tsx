"use client";

import { useAuth } from "@/components/providers/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building2,
  Megaphone,
  DollarSign,
  TrendingUp,
  Clock,
  Eye,
  UserPlus,
  Settings,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return null;
  }

  // Mock dashboard data
  const stats = {
    totalUsers: 12847,
    activeUsers: 8932,
    totalAdvertisers: 234,
    pendingAdvertisers: 12,
    totalCampaigns: 1456,
    activeCampaigns: 89,
    totalRevenue: 2847392,
    pendingPayouts: 45,
    pendingPayoutAmount: 892340,
  };

  const recentActivity = [
    {
      id: 1,
      type: "user_registration",
      message: "New user registered: john.doe@email.com",
      timestamp: "2024-01-15T10:30:00Z",
      icon: UserPlus,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "campaign_created",
      message: "New campaign created: Instagram Follow Campaign",
      timestamp: "2024-01-15T10:15:00Z",
      icon: Megaphone,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "advertiser_application",
      message: "New advertiser application from TechCorp Ltd",
      timestamp: "2024-01-15T09:45:00Z",
      icon: Building2,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "payout_request",
      message: "Payout request: ₦25,000 from user ID 4829",
      timestamp: "2024-01-15T09:30:00Z",
      icon: CreditCard,
      color: "text-orange-600",
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.activeUsers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Advertisers
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalAdvertisers.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingAdvertisers > 0 && (
                  <span className="text-orange-600 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {stats.pendingAdvertisers} pending approval
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% from last month
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Campaign Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Megaphone className="h-5 w-5" />
                <span>Campaign Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Campaigns
                </span>
                <span className="font-semibold">{stats.totalCampaigns}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Active Campaigns
                </span>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  {stats.activeCampaigns}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Completion Rate
                </span>
                <span className="font-semibold text-green-600">87%</span>
              </div>
              <Link href="/admin/campaigns">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Payout Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payout Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pending Requests
                </span>
                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                  {stats.pendingPayouts}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Pending Amount
                </span>
                <span className="font-semibold">
                  {formatCurrency(stats.pendingPayoutAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg. Processing Time
                </span>
                <span className="font-semibold text-blue-600">2.3 hours</span>
              </div>
              <Link href="/admin/payouts">
                <Button variant="outline" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  Review Payouts
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/advertisers">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Review Advertisers
                </Button>
              </Link>
              <Link href="/admin/campaigns">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Megaphone className="h-4 w-4 mr-2" />
                  Monitor Campaigns
                </Button>
              </Link>
              <Link href="/admin/settings">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Platform Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest platform events and user actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50"
                  >
                    <div
                      className={`p-2 rounded-full bg-white ${activity.color}`}
                    >
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
