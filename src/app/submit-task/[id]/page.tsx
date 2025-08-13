"use client";

import type React from "react";

import { useAuth } from "@/components/providers/auth-provider";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  AlertTriangle,
  FileImage,
  LinkIcon,
  FileText,
  History,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const submissionSchema = z
  .object({
    proofType: z.enum(["screenshot", "link", "text"]),
    proofFile: z.any().optional(),
    proofLink: z.string().url("Please enter a valid URL").optional(),
    proofText: z
      .string()
      .min(10, "Please provide at least 10 characters")
      .optional(),
    notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
  })
  .refine(
    (data) => {
      if (data.proofType === "screenshot" && !data.proofFile) {
        return false;
      }
      if (data.proofType === "link" && !data.proofLink) {
        return false;
      }
      if (data.proofType === "text" && !data.proofText) {
        return false;
      }
      return true;
    },
    {
      message: "Please provide the required proof based on your selection",
      path: ["proofFile"],
    },
  );

type SubmissionForm = z.infer<typeof submissionSchema>;

const fetchCampaignForSubmission = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));

  return {
    id,
    title: "Follow @TechStartup on Instagram",
    payout: 150,
    advertiser: "TechStartup Inc",
    instructions: [
      "Visit our Instagram profile @techstartup_official",
      "Click the 'Follow' button to follow our account",
      "Like our most recent post",
      "Take a screenshot showing completion",
      "Submit the screenshot as proof",
    ],
  };
};

const fetchExistingSubmission = async (submissionId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    id: submissionId,
    campaignId: "1",
    userId: "current_user",
    submittedAt: "2024-01-20T14:30:00Z",
    status: "rejected",
    proofType: "screenshot",
    proofUrl: "/instagram-follow-campaign.png",
    proofText:
      "I followed the account but couldn't find the latest posts to like.",
    notes: "Had some trouble finding the posts",
    advertiserFeedback:
      "Please make sure to like the 3 most recent posts as specified in the instructions.",
    advertiserRating: 2,
    reviewedAt: "2024-01-20T16:45:00Z",
  };
};

const fetchSubmissionHistory = async (campaignId: string, userId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: "sub_1",
      submittedAt: "2024-01-20T14:30:00Z",
      status: "rejected",
      proofType: "screenshot",
      proofText:
        "I followed the account but couldn't find the latest posts to like.",
      advertiserFeedback:
        "Please make sure to like the 3 most recent posts as specified in the instructions.",
      advertiserRating: 2,
      reviewedAt: "2024-01-20T16:45:00Z",
    },
    {
      id: "sub_2",
      submittedAt: "2024-01-19T10:15:00Z",
      status: "rejected",
      proofType: "link",
      proofText:
        "Here's the link to my profile showing I followed the account.",
      advertiserFeedback:
        "We need a screenshot showing the follow action and liked posts, not just a profile link.",
      advertiserRating: 1,
      reviewedAt: "2024-01-19T14:20:00Z",
    },
  ];
};

const submitTaskProof = async (
  campaignId: string,
  data: SubmissionForm,
  isResubmission = false,
) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return { success: true, submissionId: Date.now().toString(), isResubmission };
};

export default function SubmitTaskPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const {} = useToast();
  const [proofType, setProofType] = useState<"screenshot" | "link" | "text">(
    "screenshot",
  );
  const [dragActive, setDragActive] = useState(false);

  const editSubmissionId = searchParams.get("edit");
  const isEditing = !!editSubmissionId;

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["campaign-submission", params.id],
    queryFn: () => fetchCampaignForSubmission(params.id as string),
  });

  const { data: existingSubmission, isLoading: isLoadingSubmission } = useQuery(
    {
      queryKey: ["existing-submission", editSubmissionId],
      queryFn: () => fetchExistingSubmission(editSubmissionId!),
      enabled: !!editSubmissionId,
    },
  );

  const { data: submissionHistory, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["submission-history", params.id, user?.id],
    queryFn: () => fetchSubmissionHistory(params.id as string, user?.id || ""),
    enabled: isEditing && !!user?.id,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<SubmissionForm>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      proofType: "screenshot",
    },
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (existingSubmission && isEditing) {
      setProofType(
        existingSubmission.proofType as "screenshot" | "link" | "text",
      );
      reset({
        proofType: existingSubmission.proofType as
          | "screenshot"
          | "link"
          | "text",
        proofLink:
          existingSubmission.proofType === "link"
            ? existingSubmission.proofUrl
            : "",
        proofText:
          existingSubmission.proofType === "text"
            ? existingSubmission.proofText
            : "",
        notes: existingSubmission.notes || "",
      });
    }
  }, [existingSubmission, isEditing, reset]);

  const submitMutation = useMutation({
    mutationFn: (data: SubmissionForm) =>
      submitTaskProof(params.id as string, data, isEditing),
    onSuccess: (result) => {
      toast.success(
        isEditing
          ? "Task Resubmitted Successfully!"
          : "Task Submitted Successfully!",
        {
          description: isEditing
            ? "Your updated submission has been received and is under review. You'll be notified once it's reviewed."
            : "Your submission has been received and is under review. You'll be notified once it's approved.",
        },
      );
      router.push(`/campaign/${params.id}`);
    },
    onError: () => {
      toast.error("There was an error submitting your task. Please try again.");
    },
  });

  const onSubmit = async (data: SubmissionForm) => {
    await submitMutation.mutateAsync(data);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue("proofFile", e.dataTransfer.files[0]);
    }
  };

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
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (!user) return null;

  if (isLoading || (isEditing && isLoadingSubmission)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Link
            href={`/campaign/${params.id}`}
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Campaign
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditing ? "Edit & Resubmit Task" : "Submit Task"}
            </h1>
            <p className="text-gray-600">
              {isEditing
                ? "Update your submission for"
                : "Complete your submission for"}{" "}
              "{campaign?.title}"
            </p>
          </div>

          {/* Editing Notice */}
          {isEditing && existingSubmission && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <History className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Editing Previous Submission:</strong> You're updating a
                rejected submission. Your previous submission history will be
                preserved for reference.
              </AlertDescription>
            </Alert>
          )}

          {/* Campaign Summary */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{campaign?.title}</h3>
                  <p className="text-muted-foreground">
                    by {campaign?.advertiser}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(campaign?.payout || 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">reward</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission History */}
          {isEditing && submissionHistory && submissionHistory.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2 text-blue-600" />
                  Previous Submissions
                </CardTitle>
                <CardDescription>
                  Your submission history for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submissionHistory.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(submission.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(submission.status)}
                              Attempt #{submissionHistory.length - index}
                            </div>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-700 mb-2">
                        {submission.proofText}
                      </p>

                      {submission.advertiserFeedback && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 mt-2">
                          <p className="text-sm text-red-800">
                            <strong>Feedback:</strong>{" "}
                            {submission.advertiserFeedback}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions Reminder */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Task Instructions
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Review the instructions and address the feedback from your previous submission"
                  : "Make sure you've completed all steps before submitting"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {campaign?.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Previous Feedback */}
          {isEditing && existingSubmission?.advertiserFeedback && (
            <Card className="mb-8 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-800">
                  <XCircle className="h-5 w-5 mr-2" />
                  Previous Feedback
                </CardTitle>
                <CardDescription>
                  Address this feedback in your new submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">
                    {existingSubmission.advertiserFeedback}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Update Your Proof" : "Submit Your Proof"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Provide updated evidence addressing the previous feedback"
                  : "Provide evidence that you've completed the task as instructed"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Proof Type Selection */}
                <div className="space-y-3">
                  <Label>Proof Type</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        proofType === "screenshot"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setProofType("screenshot");
                        setValue("proofType", "screenshot");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <FileImage className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Screenshot</div>
                          <div className="text-sm text-muted-foreground">
                            Upload image proof
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        proofType === "link"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setProofType("link");
                        setValue("proofType", "link");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <LinkIcon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Link</div>
                          <div className="text-sm text-muted-foreground">
                            Provide URL proof
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        proofType === "text"
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        setProofType("text");
                        setValue("proofType", "text");
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">Text</div>
                          <div className="text-sm text-muted-foreground">
                            Describe completion
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Proof Upload/Input */}
                {proofType === "screenshot" && (
                  <div className="space-y-2">
                    <Label htmlFor="proofFile">Upload Screenshot</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <div className="text-sm text-gray-600 mb-2">
                        Drag and drop your screenshot here, or click to browse
                      </div>
                      <Input
                        id="proofFile"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        {...register("proofFile")}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("proofFile")?.click()
                        }
                        className="bg-transparent"
                      >
                        Choose File
                      </Button>
                      <div className="text-xs text-muted-foreground mt-2">
                        PNG, JPG, GIF up to 10MB
                      </div>
                    </div>
                    {errors.proofFile && (
                      <p className="text-sm text-destructive">
                        {errors.proofFile.message}
                      </p>
                    )}
                  </div>
                )}

                {proofType === "link" && (
                  <div className="space-y-2">
                    <Label htmlFor="proofLink">Proof URL</Label>
                    <Input
                      id="proofLink"
                      type="url"
                      placeholder="https://example.com/proof"
                      {...register("proofLink")}
                    />
                    {errors.proofLink && (
                      <p className="text-sm text-destructive">
                        {errors.proofLink.message}
                      </p>
                    )}
                  </div>
                )}

                {proofType === "text" && (
                  <div className="space-y-2">
                    <Label htmlFor="proofText">Describe Your Completion</Label>
                    <Textarea
                      id="proofText"
                      placeholder="Describe how you completed the task..."
                      rows={4}
                      {...register("proofText")}
                    />
                    {errors.proofText && (
                      <p className="text-sm text-destructive">
                        {errors.proofText.message}
                      </p>
                    )}
                  </div>
                )}

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder={
                      isEditing
                        ? "Explain how you've addressed the previous feedback..."
                        : "Any additional information or comments..."
                    }
                    rows={3}
                    {...register("notes")}
                  />
                  <div className="text-xs text-muted-foreground">
                    {watch("notes")?.length || 0}/500 characters
                  </div>
                  {errors.notes && (
                    <p className="text-sm text-destructive">
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                {/* Warning */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {isEditing
                      ? "Please ensure your updated submission addresses the previous feedback and meets all requirements. Multiple rejections may affect your account standing."
                      : "Please ensure your submission is accurate and complete. False or incomplete submissions may result in rejection and could affect your account standing."}
                  </AlertDescription>
                </Alert>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting || submitMutation.isPending}
                  >
                    {isSubmitting || submitMutation.isPending
                      ? isEditing
                        ? "Resubmitting..."
                        : "Submitting..."
                      : `${isEditing ? "Resubmit" : "Submit"} & Earn ${formatCurrency(campaign?.payout || 0)}`}
                  </Button>
                  <Link href={`/campaign/${params.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-transparent"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
