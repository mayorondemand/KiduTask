"use client";

import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCampaign, usePlatformSettings } from "@/lib/client";
import { createCampaignSchema, type CreateCampaignData } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DndContext } from "@dnd-kit/core";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Calculator,
  Clock,
  DollarSign,
  Eye,
  Plus,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function NewCampaignPage() {
  const { user } = useAuth();
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const { data: platformSettings, isLoading: isPlatformSettingsLoading } =
    usePlatformSettings();
  const createCampaignMutation = useCreateCampaign();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, errors },
  } = useForm<CreateCampaignData>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: [{ instruction: "" }],
      requirements: [{ requirement: "" }],
      payoutPerUser: 0,
      maxUsers: 0,
      expiryDate: new Date(),
      estimatedTimeMinutes: 0,
      bannerImageUrl: "",
    },
    mode: "onChange",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "instructions",
  });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  });

  const watchedValues = watch();

  const handleUploadSuccess = (url: string) => {
    setBannerImageUrl(url);
    setValue("bannerImageUrl", url);
  };

  const handleUploadError = (error: string) => {
    toast.error("An error occured while uploading the banner image", {
      description: error,
    });
  };

  const handleRemoveBanner = () => {
    setBannerImageUrl(null);
    setValue("bannerImageUrl", "");
  };

  const calculateTotalCost = () => {
    const subtotal = watchedValues.payoutPerUser * watchedValues.maxUsers;
    if (isPlatformSettingsLoading || !platformSettings) {
      return subtotal;
    }
    return subtotal + platformSettings.platformFee;
  };

  const onSubmit = () => {
    const totalCost = calculateTotalCost();

    // Check if user has sufficient balance
    if (!user?.walletBalance || user.walletBalance < totalCost) {
      toast.error("Insufficient wallet balance", {
        description: `You need ${formatCurrency(totalCost)} but only have ${formatCurrency(user?.walletBalance || 0)}. Please top up your wallet.`,
      });
      return;
    }

    // Show transaction confirmation dialog
    setShowTransactionDialog(true);
  };

  const handleConfirmTransaction = () => {
    const formData = watch();
    createCampaignMutation.mutate(formData);
  };

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <BreadcrumbResponsive />
          <div>
            <h1 className="text-3xl font-bold">Create New Campaign</h1>
            <p className="text-muted-foreground mt-1">Set up your campaign</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <DndContext>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <Card className="shadow-none rounded-sm">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      Provide the essential details about your campaign
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="pb-2 ">
                        Campaign Name
                      </Label>
                      <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="title"
                            placeholder="e.g., Instagram Follow Campaign"
                          />
                        )}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="pb-2">
                        Campaign Description
                      </Label>
                      <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                          <Textarea
                            {...field}
                            id="description"
                            placeholder="Describe what users need to do and why..."
                            rows={3}
                          />
                        )}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">
                          {errors.description.message}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Banner Image */}
                <Card className="shadow-none rounded-sm">
                  <CardHeader>
                    <CardTitle>Campaign Banner</CardTitle>
                    <CardDescription>
                      Upload an attractive banner image to make your campaign
                      stand out
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ImageUploader
                      onUploadSuccess={handleUploadSuccess}
                      onUploadError={handleUploadError}
                      currentImageUrl={bannerImageUrl || undefined}
                      onRemove={handleRemoveBanner}
                      accept="image/*"
                      maxSize={5}
                      nameToUse={`campaign-banner-${Date.now()}-${watchedValues.title}`}
                      folderToUse="/kuditask/campaigns/banners"
                    />
                    {errors.bannerImageUrl && (
                      <p className="text-sm text-red-500">
                        {errors.bannerImageUrl.message}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Task Details */}
                <Card className="shadow-none rounded-sm">
                  <CardHeader>
                    <CardTitle>Task Details</CardTitle>
                    <CardDescription>
                      Specify the requirements and instructions for taskers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Step-by-Step Instructions</Label>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            appendInstruction({ instruction: "" });
                          }}
                        >
                          <Plus className="h-4 w-4 " />
                          Add Step
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {instructionFields.map((field, index) => (
                          <div
                            key={`instruction-${field.id}`}
                            className="flex items-center gap-2"
                          >
                            <div className="flex-shrink-0 w-8 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <Controller
                              name={`instructions.${index}.instruction`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder={`Step ${index + 1} instruction...`}
                                  className="flex-1"
                                />
                              )}
                            />
                            {instructionFields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeInstruction(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.instructions && (
                        <p className="text-sm text-red-500">
                          {errors.instructions.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Additional Requirements</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => appendRequirement({ requirement: "" })}
                        >
                          <Plus className="h-4 w-4" />
                          Add Requirement
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {requirementFields.map((field, index) => (
                          <div
                            key={field.id}
                            className="flex items-center gap-2"
                          >
                            <Controller
                              name={`requirements.${index}.requirement`}
                              control={control}
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  placeholder={`Requirement ${index + 1}...`}
                                  className="flex-1"
                                />
                              )}
                            />
                            {requirementFields.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeRequirement(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.requirements && (
                        <p className="text-sm text-red-500">
                          {errors.requirements.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="estimatedTime" className="pb-2">
                          Estimated Time (minutes)
                        </Label>
                        <Controller
                          name="estimatedTimeMinutes"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="estimatedTime"
                              type="number"
                              min="1"
                              max="120"
                              onChange={(e) =>
                                field.onChange(Number.parseInt(e.target.value))
                              }
                            />
                          )}
                        />
                        {errors.estimatedTimeMinutes && (
                          <p className="text-sm text-red-500">
                            {errors.estimatedTimeMinutes.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Controller
                          name="expiryDate"
                          control={control}
                          render={({ field }) => (
                            <DatePicker
                              value={field.value}
                              onChange={field.onChange}
                              label="Campaign Expiry Date"
                              id="expiryDate"
                              placeholder="Select expiry date"
                              fromDate={tomorrow}
                              error={errors.expiryDate?.message}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Budget & Targeting */}
                <Card className="shadow-none rounded-sm">
                  <CardHeader>
                    <CardTitle>Budget & Targeting</CardTitle>
                    <CardDescription>
                      Set your budget and target audience size
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="payoutPerUser" className="pb-2">
                          Payout Per User (₦)
                        </Label>
                        <Controller
                          name="payoutPerUser"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="payoutPerUser"
                              type="number"
                              min="10"
                              onChange={(e) =>
                                field.onChange(Number.parseInt(e.target.value))
                              }
                            />
                          )}
                        />
                        {errors.payoutPerUser && (
                          <p className="text-sm text-red-500">
                            {errors.payoutPerUser.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="maxUsers" className="pb-2">
                          Maximum Users
                        </Label>
                        <Controller
                          name="maxUsers"
                          control={control}
                          render={({ field }) => (
                            <Input
                              {...field}
                              id="maxUsers"
                              type="number"
                              min="1"
                              max="10000"
                              onChange={(e) =>
                                field.onChange(Number.parseInt(e.target.value))
                              }
                            />
                          )}
                        />
                        {errors.maxUsers && (
                          <p className="text-sm text-red-500">
                            {errors.maxUsers.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {watchedValues.payoutPerUser > 0 &&
                      watchedValues.maxUsers > 0 && (
                        <Alert>
                          <Calculator className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>
                                  {formatCurrency(
                                    watchedValues.payoutPerUser *
                                      watchedValues.maxUsers,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Platform Fee:</span>
                                <span>
                                  {formatCurrency(
                                    platformSettings?.platformFee ?? 0,
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-1">
                                <span>Total Cost:</span>
                                <span>
                                  {formatCurrency(calculateTotalCost())}
                                </span>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Link href="/advertisers/campaigns">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={!isValid || createCampaignMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {createCampaignMutation.isPending
                      ? "Creating Campaign..."
                      : "Review & Create Campaign"}
                  </Button>
                </div>
              </form>
            </DndContext>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                  <CardDescription>
                    How your campaign will appear to taskers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bannerImageUrl && (
                    // biome-ignore lint/performance/noImgElement: <Preview image>
                    <img
                      src={bannerImageUrl}
                      alt="Campaign banner"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">
                      {watchedValues.title || "Campaign Name"}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {watchedValues.description ||
                      "Campaign description will appear here..."}
                  </p>

                  {watchedValues.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Instructions:
                      </h4>
                      <ol className="text-sm space-y-1">
                        {watchedValues.instructions.map(
                          (instruction, index) => (
                            <li
                              key={instruction.instruction}
                              className="flex gap-2"
                            >
                              <span className="text-muted-foreground">
                                {index + 1}.
                              </span>
                              <span>{instruction.instruction}</span>
                            </li>
                          ),
                        )}
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {watchedValues.payoutPerUser > 0
                          ? formatCurrency(watchedValues.payoutPerUser)
                          : "₦0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{watchedValues.maxUsers || 0} spots</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{watchedValues.estimatedTimeMinutes || 0}min</span>
                    </div>
                  </div>

                  {watchedValues.payoutPerUser > 0 &&
                    watchedValues.maxUsers > 0 && (
                      <div className="bg-muted p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Total Budget
                        </div>
                        <div className="text-lg font-bold text-primary">
                          {formatCurrency(calculateTotalCost())}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Including ₦
                          {platformSettings?.platformFee.toLocaleString()}{" "}
                          platform fee
                        </div>
                      </div>
                    )}

                  {!isValid && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please fill in all required fields to see the complete
                        preview.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Confirmation Dialog */}
      <Dialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Confirm Campaign Payment
            </DialogTitle>
            <DialogDescription>
              You are about to create a campaign. The total cost will be
              deducted from your wallet.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div className="flex justify-between text-sm">
                <span>Campaign Budget:</span>
                <span>
                  {formatCurrency(
                    watchedValues.payoutPerUser * watchedValues.maxUsers,
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Platform Fee:</span>
                <span>
                  {formatCurrency(platformSettings?.platformFee || 0)}
                </span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-2">
                <span>Total Cost:</span>
                <span className="text-red-600">
                  {formatCurrency(calculateTotalCost())}
                </span>
              </div>
            </div>

            <div className="bg-primary/10 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Current Wallet Balance:</span>
                <span className="font-medium">
                  {formatCurrency(user?.walletBalance || 0)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Balance After Payment:</span>
                <span>
                  {formatCurrency(
                    (user?.walletBalance || 0) - calculateTotalCost(),
                  )}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowTransactionDialog(false)}
              disabled={createCampaignMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmTransaction}
              disabled={createCampaignMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {createCampaignMutation.isPending
                ? "Processing..."
                : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
