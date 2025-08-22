"use client";

import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { StarRating } from "@/components/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdvertiserCampaign,
  useCampaignSubmissions,
  useReviewSubmission,
  useUpdateCampaign,
} from "@/lib/client";
import {
  STATUS_ENUM,
  type StatusEnum,
  type SubmissionWithUser,
} from "@/lib/types";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  Download,
  Edit,
  Loader2,
  Pause,
  Play,
  Users,
  XCircle,
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

  const {
    data: campaign,
    isLoading: isCampaignLoading,
    error: campaignError,
  } = useAdvertiserCampaign(id);

  const { data: submissionsData, isLoading: isSubmissionsLoading } =
    useCampaignSubmissions(id);

  const reviewSubmissionMutation = useReviewSubmission();
  const updateCampaignActivityMutation = useUpdateCampaign();

  const submissions = submissionsData?.submissions || [];
  const totalSubmissions = submissionsData?.totalCount || 0;

  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionWithUser | null>(null);
  const [reviewDecision, setReviewDecision] = useState<StatusEnum>(
    STATUS_ENUM.PENDING,
  );
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);

  const handleSubmissionAction = async () => {
    if (!reviewDecision || !selectedSubmission) return;

    // Validate feedback requirement
    if (reviewDecision === "rejected" && !feedback.trim()) {
      toast.warning("Feedback Required", {
        description: "Please provide feedback when rejecting a submission.",
      });
      return;
    }

    // Validate rating requirement
    if (!rating) {
      toast.warning("Rating Required", {
        description: "Please provide a rating for this submission.",
      });
      return;
    }

    await reviewSubmissionMutation.mutateAsync({
      submissionId: selectedSubmission.id,
      status: reviewDecision,
      advertiserFeedback: feedback.trim() || undefined,
      advertiserRating: rating,
    });

    if (!reviewSubmissionMutation.isSuccess) {
      return;
    }

    // Reset form
    setSelectedSubmission(null);
    setReviewDecision(STATUS_ENUM.PENDING);
    setFeedback("");
    setRating(0);
  };

  const toggleCampaignStatus = async () => {
    if (!campaign) return;

    const newStatus = campaign.activity === "active" ? "paused" : "active";

    await updateCampaignActivityMutation.mutateAsync({
      campaignId: id,
      activity: newStatus,
    });
  };

  const openReviewDialog = (submission: SubmissionWithUser) => {
    setSelectedSubmission(submission);
    setReviewDecision(STATUS_ENUM.PENDING);
    setFeedback("");
    setRating(0);
  };

  // Calculate stats
  const approvedSubmissions = submissions.filter(
    (s: SubmissionWithUser) => s.status === "approved",
  ).length;
  const pendingSubmissions = submissions.filter(
    (s: SubmissionWithUser) => s.status === "pending",
  ).length;
  const rejectedSubmissions = submissions.filter(
    (s: SubmissionWithUser) => s.status === "rejected",
  ).length;
  const progress = campaign
    ? (campaign.totalSubmissions / campaign.maxUsers) * 100
    : 0;

  // Loading state
  if (isCampaignLoading) {
    return (
      <div className="min-h-screen pt-20 bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Campaign not found</h3>
              <p className="text-muted-foreground mb-4">
                The campaign you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Link href="/advertisers/campaigns">
                <Button>Back to Campaigns</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-4 mb-8">
          <BreadcrumbResponsive />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.title}</h1>
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
            <p className="text-muted-foreground">
              Created {new Date(campaign.createdAt).toLocaleDateString()} •
              Expires{" "}
              {campaign.expiryDate
                ? new Date(campaign.expiryDate).toLocaleDateString()
                : "Never"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/advertisers/campaigns/${campaign.id}/edit`}>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Edit className="h-4 w-4" />
                Edit Campaign
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={toggleCampaignStatus}
              className="flex items-center gap-2 bg-transparent"
            >
              {campaign.activity === "active" ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause Campaign
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Resume Campaign
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Campaign Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Overview</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.bannerImageUrl && (
                  <div className="relative">
                    <Image
                      src={campaign.bannerImageUrl}
                      alt="Campaign banner"
                      className="w-full h-48 object-cover rounded-lg mb-4"
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {approvedSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Approved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {pendingSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {rejectedSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rejected
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {totalSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">Total</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Campaign Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />

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
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Spent</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(campaign.totalCost)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Est. Time</span>
                    </div>
                    <span className="font-medium">
                      {campaign.estimatedTimeMinutes}min
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
                        : "Never"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">
              Submissions ({totalSubmissions})
            </TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Submissions</CardTitle>
                  <CardDescription>
                    Review and manage all task submissions
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                {isSubmissionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading submissions...</span>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      No submissions yet
                    </h3>
                    <p className="text-muted-foreground">
                      Submissions will appear here once users start completing
                      your campaign tasks.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: SubmissionWithUser) => (
                      <div
                        key={submission.id}
                        className="flex items-start gap-4 p-4 border rounded-lg"
                      >
                        <Avatar>
                          <AvatarImage src={submission.userImage || ""} />
                          <AvatarFallback>
                            {submission.userName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">
                              {submission.userName || "Unknown User"}
                            </span>
                            <Badge
                              className={getStatusColor(submission.status)}
                            >
                              {submission.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(submission.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <p className="text-sm text-muted-foreground mb-2">
                            {submission.proofText}
                          </p>

                          {submission.advertiserFeedback && (
                            <div className="bg-muted p-2 rounded text-sm mb-2">
                              <strong>Feedback:</strong>{" "}
                              {submission.advertiserFeedback}
                            </div>
                          )}

                          {submission.advertiserRating &&
                            submission.advertiserRating > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  Rating:
                                </span>
                                <StarRating
                                  rating={submission.advertiserRating}
                                  readonly={true}
                                />
                              </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openReviewDialog(submission)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Review Submission</DialogTitle>
                                <DialogDescription>
                                  Review {submission.userName || "this user"}
                                  's submission and provide your decision
                                </DialogDescription>
                              </DialogHeader>

                              <div className="space-y-6">
                                <div>
                                  <Label>Submission Details</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {submission.proofText}
                                  </p>
                                </div>

                                {submission.proofUrl && (
                                  <div>
                                    <Label>Proof</Label>
                                    <Image
                                      src={
                                        submission.proofUrl ||
                                        "/placeholder.svg"
                                      }
                                      alt="Submission proof"
                                      width={400}
                                      height={200}
                                      className="w-full max-h-48 object-cover rounded mt-2"
                                    />
                                  </div>
                                )}

                                {submission.status === "pending" && (
                                  <>
                                    <div>
                                      <Label>Decision *</Label>
                                      <RadioGroup
                                        value={reviewDecision}
                                        onValueChange={(value) =>
                                          setReviewDecision(
                                            value as "approved" | "rejected",
                                          )
                                        }
                                        className="mt-2"
                                      >
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem
                                            value="approved"
                                            id="approved"
                                          />
                                          <Label
                                            htmlFor="approved"
                                            className="text-green-600 font-medium"
                                          >
                                            Approve Submission
                                          </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <RadioGroupItem
                                            value="rejected"
                                            id="rejected"
                                          />
                                          <Label
                                            htmlFor="rejected"
                                            className="text-red-600 font-medium"
                                          >
                                            Reject Submission
                                          </Label>
                                        </div>
                                      </RadioGroup>
                                    </div>

                                    <div>
                                      <Label>
                                        Rating * (Required for all submissions)
                                      </Label>
                                      <div className="mt-2">
                                        <StarRating
                                          rating={rating}
                                          onRatingChange={setRating}
                                          readonly={false}
                                        />
                                      </div>
                                    </div>

                                    <div>
                                      <Label htmlFor="feedback">
                                        Feedback{" "}
                                        {reviewDecision === "rejected"
                                          ? "*"
                                          : "(Optional)"}
                                      </Label>
                                      <Textarea
                                        id="feedback"
                                        placeholder={
                                          reviewDecision === "rejected"
                                            ? "Please explain why this submission is being rejected..."
                                            : "Provide feedback for the user..."
                                        }
                                        value={feedback}
                                        onChange={(e) =>
                                          setFeedback(e.target.value)
                                        }
                                        rows={3}
                                        className="mt-1"
                                      />
                                      {reviewDecision === "rejected" && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Feedback is required when rejecting
                                          submissions
                                        </p>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSubmission(null);
                                    setReviewDecision("pending");
                                    setFeedback("");
                                    setRating(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSubmissionAction}
                                  disabled={
                                    !reviewDecision ||
                                    reviewSubmissionMutation.isPending ||
                                    selectedSubmission?.status !== "pending"
                                  }
                                  className={
                                    reviewDecision === "approved"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : reviewDecision === "rejected"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : ""
                                  }
                                >
                                  {reviewSubmissionMutation.isPending ? (
                                    <>
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                      Processing...
                                    </>
                                  ) : reviewDecision === "approved" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </>
                                  ) : reviewDecision === "rejected" ? (
                                    <>
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject
                                    </>
                                  ) : (
                                    "Select Decision"
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructions">
            <Card>
              <CardHeader>
                <CardTitle>Task Instructions</CardTitle>
                <CardDescription>
                  The instructions provided to taskers for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-3">
                    Step-by-Step Instructions
                  </h3>
                  <div className="bg-muted p-4 rounded-lg">
                    <ol className="space-y-2">
                      {campaign.instructions?.map((instruction, index) => (
                        <li
                          key={`instruction-${index}-${instruction.slice(0, 20)}`}
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

                {campaign.requirements && campaign.requirements.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Requirements</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <ul className="space-y-2">
                        {campaign.requirements.map((requirement, index) => (
                          <li
                            key={`requirement-${index}-${requirement.slice(0, 20)}`}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Payout</h3>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(campaign.payoutPerUser)}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Estimated Time</h3>
                    <p className="text-2xl font-bold">
                      {campaign.estimatedTimeMinutes} minutes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Analytics</CardTitle>
                <CardDescription>
                  Performance insights and metrics for your campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalSubmissions > 0
                        ? (
                            (approvedSubmissions / totalSubmissions) *
                            100
                          ).toFixed(1)
                        : "0"}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Approval Rate
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {approvedSubmissions > 0
                        ? formatCurrency(
                            campaign.totalCost / approvedSubmissions,
                          )
                        : formatCurrency(0)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cost per Approval
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round(
                        (Date.now() - new Date(campaign.createdAt).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Days Active
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.round(
                        totalSubmissions /
                          Math.max(
                            1,
                            (Date.now() -
                              new Date(campaign.createdAt).getTime()) /
                              (1000 * 60 * 60 * 24),
                          ),
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Submissions/Day
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
