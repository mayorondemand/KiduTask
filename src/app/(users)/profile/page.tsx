"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Activity,
  Settings,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Mock user data
const mockUser = {
  id: "user123",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+234 801 234 5678",
  location: "Lagos, Nigeria",
  joinedAt: "2024-01-01",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
  stats: {
    totalEarnings: 45000,
    completedTasks: 28,
    successRate: 92,
    averageRating: 4.7,
  },
};

// Mock recent activity data
const mockRecentActivity = [
  {
    id: "1",
    campaignId: "camp_1",
    campaignName: "Instagram Follow Campaign",
    type: "task_completed",
    status: "approved",
    amount: 150,
    submittedAt: "2024-01-20T14:30:00Z",
    reviewedAt: "2024-01-20T16:45:00Z",
    feedback: "Excellent work! All requirements were met perfectly.",
    advertiserRating: 5,
    userRating: 4,
  },
  {
    id: "2",
    campaignId: "camp_2",
    campaignName: "App Store Review Task",
    type: "task_completed",
    status: "pending",
    amount: 200,
    submittedAt: "2024-01-19T10:15:00Z",
    reviewedAt: null,
    feedback: null,
    advertiserRating: 0,
    userRating: 0,
  },
  {
    id: "3",
    campaignId: "camp_3",
    campaignName: "YouTube Subscribe Campaign",
    type: "task_completed",
    status: "rejected",
    amount: 100,
    submittedAt: "2024-01-18T09:20:00Z",
    reviewedAt: "2024-01-18T15:30:00Z",
    feedback:
      "Screenshot did not show the subscription. Please ensure you follow all steps.",
    advertiserRating: 2,
    userRating: 3,
  },
  {
    id: "4",
    campaignId: "camp_4",
    campaignName: "Facebook Page Like Task",
    type: "task_completed",
    status: "approved",
    amount: 80,
    submittedAt: "2024-01-17T16:45:00Z",
    reviewedAt: "2024-01-17T18:20:00Z",
    feedback: "Good work! Thank you for participating.",
    advertiserRating: 4,
    userRating: 5,
  },
  {
    id: "5",
    campaignId: "camp_5",
    campaignName: "Survey Completion Task",
    type: "task_completed",
    status: "approved",
    amount: 120,
    submittedAt: "2024-01-16T11:30:00Z",
    reviewedAt: "2024-01-16T14:15:00Z",
    feedback: "Comprehensive responses. Well done!",
    advertiserRating: 5,
    userRating: 4,
  },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) {
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
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={mockUser.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {mockUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
                <CardDescription>
                  Member since {new Date(mockUser.joinedAt).getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mockUser.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mockUser.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{mockUser.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Joined {new Date(mockUser.joinedAt).toLocaleDateString()}
                  </span>
                </div>

                <Separator />

                <Link href="/settings">
                  <Button variant="outline" className="w-full bg-transparent">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Total Earnings</span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(mockUser.stats.totalEarnings)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Completed Tasks</span>
                  </div>
                  <span className="font-bold">
                    {mockUser.stats.completedTasks}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Success Rate</span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {mockUser.stats.successRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">
                      {mockUser.stats.averageRating}
                    </span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest task submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/campaign/${activity.campaignId}`}
                    >
                      <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0">
                          <Badge className={getStatusColor(activity.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(activity.status)}
                              {activity.status.charAt(0).toUpperCase() +
                                activity.status.slice(1)}
                            </div>
                          </Badge>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">
                              {activity.campaignName}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">
                                {formatCurrency(activity.amount)}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            Submitted{" "}
                            {new Date(
                              activity.submittedAt,
                            ).toLocaleDateString()}
                            {activity.reviewedAt && (
                              <span>
                                {" "}
                                • Reviewed{" "}
                                {new Date(
                                  activity.reviewedAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </p>

                          {activity.feedback && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800 bg-blue-50 rounded p-2 flex-1">
                                {activity.feedback}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            {activity.advertiserRating > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Their rating:
                                </span>
                                {renderStarRating(activity.advertiserRating)}
                              </div>
                            )}
                            {activity.userRating > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Your rating:
                                </span>
                                {renderStarRating(activity.userRating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {mockRecentActivity.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">No Recent Activity</h3>
                    <p className="text-muted-foreground mb-4">
                      Start completing tasks to see your activity here.
                    </p>
                    <Link href="/campaigns">
                      <Button>Browse Campaigns</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
