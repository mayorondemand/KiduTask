"use client";

import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { StarRating } from "@/components/star-rating";
import { StatusIcon } from "@/components/status-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  usePublicCampaign,
  useRateCampaign,
  useMySubmissions,
  useMyCampaignRating,
} from "@/lib/client";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Loader2,
  MessageSquare,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";

export default function CampaignDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [userRating, setUserRating] = useState(0);

  // Fetch user's existing rating for this campaign
  const { data: existingRating } = useMyCampaignRating(id);
  // Fetch campaign data
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = usePublicCampaign(id);

  // Fetch user's submissions for this campaign
  const { data: userSubmissions = [], isLoading: submissionsLoading } =
    useMySubmissions(id);

  // Get the most recent submission
  const userSubmission = userSubmissions.length > 0 ? userSubmissions[0] : null;

  // Rating mutation
  const ratingMutation = useRateCampaign();

  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      toast.error("Please select a rating before submitting.");
      return;
    }

    ratingMutation.mutate(
      { campaignId: id, rating: userRating },
      {
        onSuccess: () => {
          setUserRating(0); // Reset rating after successful submission
        },
      },
    );
  };

  // Can rate if user has a completed submission (not pending) and hasn't rated yet
  const canRate =
    userSubmission && userSubmission.status !== "pending" && !existingRating;

  // Loading state
  if (campaignLoading || submissionsLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="animate-spin  border-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Loading campaign details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <BreadcrumbResponsive />
          <div className="flex items-center justify-center h-64">
            <div className="text-center flex flex-col gap-4">
              <div>
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">
                  Campaign Not Found
                </h2>
                <p className="text-muted-foreground mb-4">
                  This campaign may not exist or is no longer available.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <BreadcrumbResponsive />
        <div className="flex items-center gap-4 mt-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {campaign.activity}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {campaign.expiryDate &&
                `Expires ${new Date(campaign.expiryDate).toLocaleDateString()} • `}
              {formatCurrency(campaign.payoutPerUser)} payout
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Overview */}
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.bannerImageUrl && (
                  <div className="relative h-48 rounded-lg overflow-clip mb-4">
                    <Image
                      src={campaign.bannerImageUrl || ""}
                      alt="Campaign banner"
                      className="object-cover"
                      fill
                    />
                  </div>
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
                          <li
                            key={`instruction-${instruction.slice(0, 20)}-${index}`}
                            className="flex gap-3"
                          >
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
                            <li
                              key={`requirement-${requirement.slice(0, 20)}-${index}`}
                              className="flex gap-3"
                            >
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
                        {campaign.remainingSlots}
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
              <Card className="shadow-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Your Submission
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(userSubmission.status)}>
                      <div className="flex capitalize items-center gap-1">
                        <StatusIcon status={userSubmission.status} />
                        {userSubmission.status}
                      </div>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Submitted{" "}
                      {new Date(userSubmission.createdAt).toLocaleString()}
                    </span>
                    {userSubmission.statusUpdatedAt && (
                      <span className="text-sm text-muted-foreground">
                        • Reviewed{" "}
                        {new Date(
                          userSubmission.statusUpdatedAt,
                        ).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Your Submission</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {userSubmission.proofText}
                    </p>

                    {userSubmission.proofUrl && (
                      <div className="relative h-48 border rounded-lg overflow-clip mb-4">
                        <Image
                          src={userSubmission.proofUrl || ""}
                          alt="Submission proof"
                          className=" object-cover"
                          fill
                        />
                      </div>
                    )}
                  </div>

                  {userSubmission.advertiserFeedback && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-medium text-primary mb-1">
                            Advertiser Feedback
                          </h4>
                          <p className="text-sm text-primary">
                            {userSubmission.advertiserFeedback}
                          </p>

                          {userSubmission.advertiserRating &&
                            userSubmission.advertiserRating > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm font-medium text-primary">
                                  Their Rating:
                                </span>
                                <StarRating
                                  rating={userSubmission.advertiserRating}
                                />
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
                            Your submission was rejected, but you can create a
                            new submission. Your previous submission will be
                            kept for reference.
                          </p>
                          <Link
                            href={`/submit-task/${campaign.id}?edit=${userSubmission.id}`}
                          >
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Create New Submission
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
                        How was your experience with this campaign and
                        advertiser? Your rating helps improve the platform for
                        everyone.
                      </p>
                      <div className="text-xs text-green-700 mb-3 p-2 bg-green-100 rounded">
                        ⚠️ <strong>Note:</strong> Once you submit your rating,
                        you cannot change it.
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Rating:</span>
                          <StarRating
                            rating={userRating}
                            onRatingChange={setUserRating}
                            readonly={false}
                          />
                        </div>
                        <Button
                          onClick={handleRatingSubmit}
                          disabled={
                            userRating === 0 || ratingMutation.isPending
                          }
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {ratingMutation.isPending
                            ? "Submitting..."
                            : "Submit Rating"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Show existing rating if user has already rated */}
                  {existingRating && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <h4 className="font-medium text-primary mb-3">
                        Your Rating
                      </h4>
                      <p className="text-sm text-primary mb-3">
                        You have already rated this campaign.
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Your Rating:
                        </span>
                        <StarRating rating={existingRating} readonly={true} />
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
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Completion</span>
                  <span className="text-sm font-medium">
                    {Math.round(campaign.completionRate)}%
                  </span>
                </div>
                <Progress value={campaign.completionRate} className="h-2" />

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Submissions</span>
                    </div>
                    <span className="font-medium">
                      {campaign.totalSubmissions}/{campaign.maxUsers}
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
                      {campaign.totalSubmissions - campaign.approvedSubmissions}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Expires</span>
                    </div>
                    <span className="font-medium">
                      {campaign.expiryDate
                        ? new Date(campaign.expiryDate).toLocaleDateString()
                        : "No expiry"}
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

            {userSubmission && userSubmission.status === "approved" && (
              <Card className="bg-green-50 border-green-200 shadow-none">
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
