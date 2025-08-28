"use client";

import { usePublicAuth } from "@/components/providers/public-auth-provider";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useUserProfile } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import {
  Activity,
  Award,
  Calendar,
  Check,
  ChevronRight,
  DollarSign,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Settings,
  Star,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { data } = useUserProfile();
  const { user } = usePublicAuth();

  const stats = data?.stats ?? {
    totalEarnings: 0,
    completedTasks: 0,
    successRate: 0,
    averageRating: 0,
  };

  const recentActivity = data?.recentActivity;

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="shadow-none">
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={user?.image || ""} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl">{user?.name}</CardTitle>
                <CardDescription>
                  Member since{" "}
                  {new Date(user?.createdAt || new Date()).getFullYear()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
                {user?.phoneNumber && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.phoneNumber}</span>
                  </div>
                )}
                {user?.address && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.address}</span>
                  </div>
                )}
                {user?.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
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
            <Card className="mt-6 shadow-none">
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
                    {formatCurrency(stats.totalEarnings)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Completed Tasks</span>
                  </div>
                  <span className="font-bold">{stats.completedTasks}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Success Rate</span>
                  </div>
                  <span className="font-bold text-purple-600">
                    {stats.successRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold">{stats.averageRating}</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="shadow-none">
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
                  {recentActivity?.map((activity) => (
                    <Link
                      key={activity.id}
                      href={`/campaign/${activity.campaignId}`}
                    >
                      <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0">
                          <StatusBadge status={activity.status} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">
                              {activity.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-600">
                                {formatCurrency(activity.payoutPerUser)}
                              </span>
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            Submitted{" "}
                            {new Date(activity.createdAt).toLocaleDateString()}
                            {activity.statusUpdatedAt && (
                              <span>
                                {" "}
                                • Reviewed{" "}
                                {new Date(
                                  activity.statusUpdatedAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </p>

                          {activity.advertiserFeedback && (
                            <div className="flex items-start gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800 bg-blue-50 rounded p-2 flex-1">
                                {activity.advertiserFeedback}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-sm">
                            {activity.advertiserRating &&
                              activity.advertiserRating > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-muted-foreground">
                                    Their rating:
                                  </span>
                                  <StarRating
                                    rating={activity.advertiserRating}
                                  />
                                </div>
                              )}
                            {activity.rating && activity.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-muted-foreground">
                                  Your rating:
                                </span>
                                <StarRating rating={activity.rating} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {recentActivity?.length === 0 && (
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
