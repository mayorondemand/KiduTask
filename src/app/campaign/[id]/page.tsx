"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Star,
  MessageSquare,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toast } from "sonner";

// Mock campaign data
const mockCampaign = {
  id: "1",
  name: "Instagram Follow Campaign",
  status: "active",
  description:
    "Follow our Instagram account and like our latest posts to help us grow our social media presence.",
  instructions: [
    "Go to our Instagram page @kuditask_official",
    "Follow our account",
    "Like our latest 3 posts",
    "Take a screenshot showing you followed and liked the posts",
    "Submit the screenshot as proof",
  ],
  requirements: [
    "Must have an active Instagram account with at least 50 followers",
    "Account must be at least 30 days old",
    "Must be 18+ years old",
  ],
  payoutPerUser: 150,
  maxUsers: 100,
  currentSubmissions: 75,
  approvedSubmissions: 60,
  pendingSubmissions: 15,
  rejectedSubmissions: 5,
  totalSpent: 9000,
  budget: 15000,
  createdAt: "2024-01-15",
  expiresAt: "2024-01-22",
  estimatedTimeMinutes: 5,
  bannerImage: "/instagram-follow-campaign.png",
};

// Mock user submission data
const mockUserSubmission = {
  id: "sub_123",
  campaignId: "1",
  userId: "current_user",
  submittedAt: "2024-01-20T14:30:00Z",
  status: "approved", // pending, approved, rejected, paid
  proofText:
    "I have successfully followed @kuditask_official and liked the latest 3 posts as requested. Screenshot attached showing completion.",
  proofUrl: "/instagram-follow-campaign.png",
  advertiserFeedback:
    "Excellent work! All requirements were met perfectly. Thank you for your participation.",
  advertiserRating: 5,
  userRating: 0, // User's rating of the advertiser (0 means not rated yet)
  reviewedAt: "2024-01-20T16:45:00Z",
  paidAt: null,
};

export default function CampaignDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const {} = useToast();
  const [campaign] = useState(mockCampaign);
  const [userSubmission, setUserSubmission] = useState(mockUserSubmission);
  const [userRating, setUserRating] = useState(0);
  const [isRatingSubmission, setIsRatingSubmission] = useState(false);

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
      minimumFractionDigits: 0,
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
      case "paid":
        return "bg-blue-100 text-blue-800 border-blue-200";
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
      case "paid":
        return <DollarSign className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const renderStarRating = (
    currentRating: number,
    onRatingChange?: (rating: number) => void,
    readonly = false,
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 transition-colors ${readonly ? "" : "cursor-pointer"} ${
              star <= currentRating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => !readonly && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    setIsRatingSubmission(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUserSubmission((prev) => ({
        ...prev,
        userRating: userRating,
      }));

      toast.success(
        "Thank you for rating your experience with this advertiser.",
      );
    } catch (error) {
      toast.error("Failed to submit rating. Please try again.");
    } finally {
      setIsRatingSubmission(false);
    }
  };

  const canRate =
    userSubmission &&
    (userSubmission.status === "approved" ||
      userSubmission.status === "rejected") &&
    userSubmission.userRating === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Expires {new Date(campaign.expiresAt).toLocaleDateString()} •{" "}
              {formatCurrency(campaign.payoutPerUser)} payout
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.bannerImage && (
                  <img
                    src={campaign.bannerImage || "/placeholder.svg"}
                    alt="Campaign banner"
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-muted-foreground">
                      {campaign.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Instructions</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <ol className="space-y-2">
                        {campaign.instructions.map((instruction, index) => (
                          <li key={index} className="flex gap-3">
                            <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="text-sm">{instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {campaign.requirements.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Requirements</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <ul className="space-y-2">
                          {campaign.requirements.map((requirement, index) => (
                            <li key={index} className="flex gap-3">
                              <span className="text-muted-foreground">•</span>
                              <span className="text-sm">{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(campaign.payoutPerUser)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Payout
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {campaign.estimatedTimeMinutes}min
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Est. Time
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {campaign.maxUsers - campaign.currentSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Spots Left
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User's Submission Status */}
            {userSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(userSubmission.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(userSubmission.status)}
                        {userSubmission.status.charAt(0).toUpperCase() +
                          userSubmission.status.slice(1)}
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Submitted{" "}
                      {new Date(userSubmission.submittedAt).toLocaleString()}
                    </span>
                    {userSubmission.reviewedAt && (
                      <span className="text-sm text-muted-foreground">
                        • Reviewed{" "}
                        {new Date(userSubmission.reviewedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Your Submission</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {userSubmission.proofText}
                    </p>

                    {userSubmission.proofUrl && (
                      <div className="mb-3">
                        <img
                          src={userSubmission.proofUrl || "/placeholder.svg"}
                          alt="Submission proof"
                          className="max-w-sm rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  {userSubmission.advertiserFeedback && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-blue-900 mb-1">
                            Advertiser Feedback
                          </h4>
                          <p className="text-sm text-blue-800">
                            {userSubmission.advertiserFeedback}
                          </p>

                          {userSubmission.advertiserRating > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium text-blue-900">
                                Their Rating:
                              </span>
                              {renderStarRating(
                                userSubmission.advertiserRating,
                                undefined,
                                true,
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {userSubmission.status === "rejected" && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-orange-900 mb-1">
                            Submission Rejected
                          </h4>
                          <p className="text-sm text-orange-800 mb-3">
                            Your submission was rejected, but you can edit and
                            resubmit it. Your previous submission will be kept
                            for reference.
                          </p>
                          <Link
                            href={`/submit-task/${campaign.id}?edit=${userSubmission.id}`}
                          >
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit & Resubmit
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User Rating Section */}
                  {canRate && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-3">
                        Rate Your Experience
                      </h4>
                      <p className="text-sm text-green-800 mb-3">
                        How was your experience with this advertiser? Your
                        rating helps improve the platform.
                      </p>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rating:</span>
                          {renderStarRating(userRating, setUserRating)}
                        </div>
                        <Button
                          onClick={handleRatingSubmit}
                          disabled={userRating === 0 || isRatingSubmission}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isRatingSubmission
                            ? "Submitting..."
                            : "Submit Rating"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {userSubmission.userRating > 0 && (
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Your Rating:
                        </span>
                        {renderStarRating(
                          userSubmission.userRating,
                          undefined,
                          true,
                        )}
                        <span className="text-sm text-muted-foreground">
                          • Thank you for your feedback!
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion</span>
                  <span className="text-sm font-medium">
                    {Math.round(
                      (campaign.currentSubmissions / campaign.maxUsers) * 100,
                    )}
                    %
                  </span>
                </div>
                <Progress
                  value={
                    (campaign.currentSubmissions / campaign.maxUsers) * 100
                  }
                  className="h-2"
                />

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Submissions</span>
                    </div>
                    <span className="font-medium">
                      {campaign.currentSubmissions}/{campaign.maxUsers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm">Approved</span>
                    </div>
                    <span className="font-medium text-green-600">
                      {campaign.approvedSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <span className="font-medium text-yellow-600">
                      {campaign.pendingSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Expires</span>
                    </div>
                    <span className="font-medium">
                      {new Date(campaign.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Button */}
            {!userSubmission && (
              <Link href={`/submit-task/${campaign.id}`}>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Start Task - {formatCurrency(campaign.payoutPerUser)}
                </Button>
              </Link>
            )}

            {userSubmission &&
              userSubmission.status === "approved" &&
              !userSubmission.paidAt && (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-medium text-green-900 mb-1">
                        Task Approved!
                      </h3>
                      <p className="text-sm text-green-800 mb-3">
                        Your submission has been approved. Payment will be
                        processed within 24 hours.
                      </p>
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(campaign.payoutPerUser)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
