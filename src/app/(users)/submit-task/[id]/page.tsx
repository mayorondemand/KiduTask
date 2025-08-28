"use client";

import { StatusIcon } from "@/components/status-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  useMySubmissions,
  usePublicCampaign,
  useSubmitTask,
} from "@/lib/public-client";
import { submissionFormSchema, type SubmissionFormData } from "@/lib/types";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileImage,
  FileText,
  History,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function SubmitTaskPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const editSubmissionId = searchParams.get("edit");
  const isEditing = !!editSubmissionId;
  const campaignId = params.id ? params.id[0] : "";
  // Fetch campaign data
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = usePublicCampaign(campaignId);

  // Fetch user's submission history for this campaign
  const { data: userSubmissions = [], isLoading: isLoadingSubmissions } =
    useMySubmissions(params.id as string);

  const removeSpaces = (text: string) => {
    return text.replace(/\s/g, "-");
  };

  const form = useForm<SubmissionFormData>({
    resolver: zodResolver(submissionFormSchema),
    defaultValues: {
      proofType: "screenshot",
      proofUrl: "",
      proofText: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    setValue,
    watch,
  } = form;
  const proofType = watch("proofType");

  // Mutation hooks
  const createSubmissionMutation = useSubmitTask();

  const onSubmit = async (data: SubmissionFormData) => {
    const validatedData = submissionFormSchema.safeParse(data);
    if (!validatedData.success) {
      toast.error("Invalid data", {
        description: validatedData.error.message,
      });
      return;
    }
    const { proofType, proofUrl, proofText, notes } = validatedData.data;
    try {
      const submissionData = {
        proofType,
        proofUrl: proofType === "screenshot" ? proofUrl : "",
        proofText:
          proofType === "text" || proofType === "link" ? proofText : "",
        notes,
      };

      // Create new submission
      await createSubmissionMutation.mutateAsync({
        campaignId: params.id as string,
        data: submissionData,
      });

      router.push(`/campaign/${params.id}`);
    } catch (error) {
      toast.error("An error occured", {
        description: `${error instanceof Error ? error.message : "Unknown error"}`,
      });
    }
  };

  // Image upload handlers
  const handleImageUploadSuccess = (url: string) => {
    setValue("proofUrl", url);
  };

  const handleImageUploadError = (error: string) => {
    toast.error(`Upload failed: ${error}`);
  };

  const handleImageRemove = () => {
    setValue("proofUrl", "");
  };

  const isLoading = campaignLoading || (isEditing && isLoadingSubmissions);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
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

  // Error state
  if (campaignError || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Campaign Not Found</h2>
              <p className="text-muted-foreground mb-4">
                This campaign may not exist or is no longer available.
              </p>
              <Link href="/campaigns">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaigns
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
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
              {campaign.title}
            </p>
          </div>

          {/* Editing Notice */}
          {isEditing && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <History className="h-4 w-4" />
              <AlertDescription className="text-orange-800">
                <strong>Editing Previous Submission:</strong> You&apos;re
                updating a rejected submission. Your previous submission history
                will be preserved for reference.
              </AlertDescription>
            </Alert>
          )}

          {/* Campaign Summary */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{campaign.title}</h3>
                  <p className="text-muted-foreground">
                    by {campaign.advertiserBrandName || "Advertiser"}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(campaign.payoutPerUser)}
                  </div>
                  <div className="text-sm text-muted-foreground">reward</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission History */}
          {isEditing && userSubmissions && userSubmissions.length > 0 && (
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
                  {userSubmissions.map((submission, index) => (
                    <div
                      key={submission.id}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(submission.status)}>
                            <div className="flex items-center gap-1">
                              <StatusIcon status={submission.status} />
                              Attempt #{userSubmissions.length - index}
                            </div>
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.createdAt).toLocaleString()}
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
                {campaign.instructions.map((instruction, index) => (
                  <li
                    key={`instruction-${instruction.slice(0, 20)}-${index}`}
                    className="flex items-start space-x-2"
                  >
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

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
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Proof Type Selection */}
                  <FormField
                    control={control}
                    name="proofType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proof Type</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              type="button"
                              className={`border rounded-lg p-4 cursor-pointer transition-colors text-left ${
                                field.value === "screenshot"
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                field.onChange("screenshot");
                                setValue("proofType", "screenshot");
                                setValue("proofText", "");
                                setValue("proofUrl", "");
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
                            </button>

                            <button
                              type="button"
                              className={`border rounded-lg p-4 cursor-pointer transition-colors text-left ${
                                field.value === "link"
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                field.onChange("link");
                                setValue("proofType", "link");
                                setValue("proofText", "");
                                setValue("proofUrl", "");
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
                            </button>

                            <button
                              type="button"
                              className={`border rounded-lg p-4 cursor-pointer transition-colors text-left ${
                                field.value === "text"
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => {
                                field.onChange("text");
                                setValue("proofType", "text");
                                setValue("proofUrl", "");
                                setValue("proofText", "");
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
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Proof Upload/Input */}
                  {proofType === "screenshot" && (
                    <FormField
                      control={control}
                      name="proofUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Upload Screenshot</FormLabel>
                          <FormControl>
                            <ImageUploader
                              nameToUse={`submission-${Date.now()}`}
                              folderToUse={`kuditask/campaign-submissions/${removeSpaces(campaign.title)}-${campaign.id}`}
                              onUploadSuccess={handleImageUploadSuccess}
                              onUploadError={handleImageUploadError}
                              currentImageUrl={field.value}
                              onRemove={handleImageRemove}
                              maxSize={10}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {proofType === "link" && (
                    <FormField
                      control={control}
                      name="proofText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://example.com/proof"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {proofType === "text" && (
                    <FormField
                      control={control}
                      name="proofText"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Describe Your Completion</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe how you completed the task..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Additional Notes */}
                  <FormField
                    control={control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              isEditing
                                ? "Explain how you've addressed the previous feedback..."
                                : "Any additional information or comments..."
                            }
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/500 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                      disabled={
                        isSubmitting || createSubmissionMutation.isPending
                      }
                    >
                      {isSubmitting || createSubmissionMutation.isPending
                        ? isEditing
                          ? "Resubmitting..."
                          : "Submitting..."
                        : `${isEditing ? "Resubmit" : "Submit"} & Earn ${formatCurrency(campaign.payoutPerUser)}`}
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
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
