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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Pause,
  Play,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Star,
  Edit,
  History,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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

// Mock campaign history
const mockCampaignHistory = [
  {
    id: "1",
    action: "Campaign Created",
    description: "Campaign was created and submitted for approval",
    timestamp: "2024-01-15T10:00:00Z",
    user: "John Advertiser",
    details: "Initial campaign setup with ₦150 payout per user",
  },
  {
    id: "2",
    action: "Campaign Approved",
    description: "Campaign was approved by admin and went live",
    timestamp: "2024-01-15T14:30:00Z",
    user: "Admin",
    details: "Campaign meets all platform guidelines",
  },
  {
    id: "3",
    action: "Budget Updated",
    description: "Maximum users increased from 50 to 100",
    timestamp: "2024-01-16T09:15:00Z",
    user: "John Advertiser",
    details: "Budget expanded to accommodate more participants",
  },
  {
    id: "4",
    action: "Instructions Modified",
    description: "Added requirement for screenshot proof",
    timestamp: "2024-01-16T11:45:00Z",
    user: "John Advertiser",
    details: "Enhanced verification process for better quality control",
  },
  {
    id: "5",
    action: "First Submission",
    description: "Received first task submission",
    timestamp: "2024-01-16T15:20:00Z",
    user: "System",
    details: "Campaign gaining traction with users",
  },
  {
    id: "6",
    action: "Milestone Reached",
    description: "50% completion milestone reached",
    timestamp: "2024-01-18T12:00:00Z",
    user: "System",
    details: "50 out of 100 submissions received",
  },
];

// Mock submissions data
const mockSubmissions = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    submittedAt: "2024-01-20T10:30:00Z",
    status: "pending",
    proofType: "screenshot",
    proofUrl: "/instagram-follow-campaign.png",
    proofText:
      "Followed @kuditask_official and liked the latest 3 posts as requested.",
    feedback: "",
    rating: 0,
  },
  {
    id: "2",
    userId: "user2",
    userName: "Jane Smith",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
    submittedAt: "2024-01-20T09:15:00Z",
    status: "approved",
    proofType: "screenshot",
    proofUrl: "/instagram-follow-campaign.png",
    proofText: "Completed all steps successfully. Screenshot attached.",
    feedback: "Great work! All requirements met.",
    rating: 5,
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Johnson",
    userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike",
    submittedAt: "2024-01-20T08:45:00Z",
    status: "rejected",
    proofType: "screenshot",
    proofUrl: "/instagram-follow-campaign.png",
    proofText:
      "I followed the account but couldn't find the latest posts to like.",
    feedback:
      "Please make sure to like the 3 most recent posts as specified in the instructions.",
    rating: 2,
  },
];

export default function CampaignDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [campaign] = useState(mockCampaign);
  const [submissions, setSubmissions] = useState(mockSubmissions);
  const [campaignHistory] = useState(mockCampaignHistory);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewDecision, setReviewDecision] = useState<
    "approve" | "reject" | ""
  >("");
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleSubmissionAction = async () => {
    if (!reviewDecision) return;

    // Validate feedback requirement
    if (reviewDecision === "reject" && !feedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback when rejecting a submission.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === selectedSubmission.id
            ? {
                ...sub,
                status: reviewDecision === "approve" ? "approved" : "rejected",
                feedback: feedback.trim(),
                rating: reviewDecision === "approve" ? rating : 0,
              }
            : sub,
        ),
      );

      toast({
        title:
          reviewDecision === "approve"
            ? "Submission Approved"
            : "Submission Rejected",
        description: `The submission has been ${reviewDecision}d successfully.`,
      });

      // Reset form
      setSelectedSubmission(null);
      setReviewDecision("");
      setFeedback("");
      setRating(0);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCampaignStatus = async () => {
    const newStatus = campaign.status === "active" ? "paused" : "active";

    toast({
      title: `Campaign ${newStatus === "active" ? "Resumed" : "Paused"}`,
      description: `Your campaign is now ${newStatus}.`,
    });
  };

  const openReviewDialog = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewDecision("");
    setFeedback("");
    setRating(0);
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

  const progress = (campaign.currentSubmissions / campaign.maxUsers) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/advertisers/campaigns">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{campaign.name}</h1>
              <Badge className={getStatusColor(campaign.status)}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {new Date(campaign.createdAt).toLocaleDateString()} •
              Expires {new Date(campaign.expiresAt).toLocaleDateString()}
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
              {campaign.status === "active" ? (
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

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {campaign.approvedSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Approved
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {campaign.pendingSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {campaign.rejectedSubmissions}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Rejected
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {campaign.currentSubmissions}
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
                      {campaign.currentSubmissions}/{campaign.maxUsers}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Spent</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(campaign.totalSpent)}
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
                      {new Date(campaign.expiresAt).toLocaleDateString()}
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
              Submissions ({campaign.currentSubmissions})
            </TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="history">Campaign History</TabsTrigger>
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
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div
                      key={submission.id}
                      className="flex items-start gap-4 p-4 border rounded-lg"
                    >
                      <Avatar>
                        <AvatarImage
                          src={submission.userAvatar || "/placeholder.svg"}
                        />
                        <AvatarFallback>
                          {submission.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">
                            {submission.userName}
                          </span>
                          <Badge
                            className={
                              submission.status === "approved"
                                ? "bg-green-100 text-green-800"
                                : submission.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {submission.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-sm text-muted-foreground mb-2">
                          {submission.proofText}
                        </p>

                        {submission.feedback && (
                          <div className="bg-muted p-2 rounded text-sm mb-2">
                            <strong>Feedback:</strong> {submission.feedback}
                          </div>
                        )}

                        {submission.status !== "pending" &&
                          submission.rating > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                Rating:
                              </span>
                              {renderStarRating(
                                submission.rating,
                                undefined,
                                true,
                              )}
                            </div>
                          )}
                      </div>

                      <div className="flex items-center gap-2">
                        {submission.proofUrl && (
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}

                        {submission.status === "pending" && (
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
                                  Review {submission.userName}'s submission and
                                  provide your decision
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
                                    <img
                                      src={
                                        submission.proofUrl ||
                                        "/placeholder.svg"
                                      }
                                      alt="Submission proof"
                                      className="w-full max-h-48 object-cover rounded mt-2"
                                    />
                                  </div>
                                )}

                                <div>
                                  <Label>Decision *</Label>
                                  <RadioGroup
                                    value={reviewDecision}
                                    onValueChange={(value) =>
                                      setReviewDecision(
                                        value as "approve" | "reject",
                                      )
                                    }
                                    className="mt-2"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value="approve"
                                        id="approve"
                                      />
                                      <Label
                                        htmlFor="approve"
                                        className="text-green-600 font-medium"
                                      >
                                        Approve Submission
                                      </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem
                                        value="reject"
                                        id="reject"
                                      />
                                      <Label
                                        htmlFor="reject"
                                        className="text-red-600 font-medium"
                                      >
                                        Reject Submission
                                      </Label>
                                    </div>
                                  </RadioGroup>
                                </div>

                                {reviewDecision === "approve" && (
                                  <div>
                                    <Label>Rating (Optional)</Label>
                                    <div className="mt-2">
                                      {renderStarRating(rating, setRating)}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label htmlFor="feedback">
                                    Feedback{" "}
                                    {reviewDecision === "reject"
                                      ? "*"
                                      : "(Optional)"}
                                  </Label>
                                  <Textarea
                                    id="feedback"
                                    placeholder={
                                      reviewDecision === "reject"
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
                                  {reviewDecision === "reject" && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Feedback is required when rejecting
                                      submissions
                                    </p>
                                  )}
                                </div>
                              </div>

                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedSubmission(null);
                                    setReviewDecision("");
                                    setFeedback("");
                                    setRating(0);
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  onClick={handleSubmissionAction}
                                  disabled={!reviewDecision || isProcessing}
                                  className={
                                    reviewDecision === "approve"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : reviewDecision === "reject"
                                        ? "bg-red-600 hover:bg-red-700"
                                        : ""
                                  }
                                >
                                  {isProcessing ? (
                                    "Processing..."
                                  ) : reviewDecision === "approve" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve
                                    </>
                                  ) : reviewDecision === "reject" ? (
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
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Campaign History
                </CardTitle>
                <CardDescription>
                  Track all changes and activities for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignHistory.map((historyItem, index) => (
                    <div key={historyItem.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                          <Activity className="h-4 w-4" />
                        </div>
                        {index < campaignHistory.length - 1 && (
                          <div className="w-px h-12 bg-border mt-2" />
                        )}
                      </div>

                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{historyItem.action}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(historyItem.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {historyItem.description}
                        </p>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              By: {historyItem.user}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {historyItem.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
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
                      {(
                        (campaign.approvedSubmissions /
                          campaign.currentSubmissions) *
                        100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Approval Rate
                    </div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(
                        campaign.totalSpent / campaign.approvedSubmissions,
                      )}
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
                        campaign.currentSubmissions /
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

                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Detailed analytics charts coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
