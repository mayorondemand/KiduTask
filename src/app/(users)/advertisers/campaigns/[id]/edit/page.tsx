"use client";

import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { usePublicAuth } from "@/components/providers/public-auth-provider";
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
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdvertiserCampaign, useUpdateCampaign } from "@/lib/public-client";
import {
  STATUS_ENUM,
  updateCampaignSchema,
  type UpdateCampaignActivityData,
} from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock, DollarSign, Eye, Plus, Users } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = usePublicAuth();
  const { id } = use(params);
  const { data: campaign, isLoading } = useAdvertiserCampaign(id);
  const updateMutation = useUpdateCampaign();
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);

  const defaultValues = useMemo<Partial<UpdateCampaignActivityData>>(
    () => ({
      title: "",
      description: "",
      instructions: [{ instruction: "" }],
      requirements: [{ requirement: "" }],
      payoutPerUser: 0,
      maxUsers: 0,
      estimatedTimeMinutes: 0,
      expiryDate: new Date(),
      bannerImageUrl: "",
    }),
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isValid, errors },
  } = useForm<UpdateCampaignActivityData>({
    resolver: zodResolver(updateCampaignSchema),
    defaultValues: defaultValues as UpdateCampaignActivityData,
    mode: "onChange",
  });

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({ control, name: "instructions" });

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({ control, name: "requirements" });

  useEffect(() => {
    if (campaign) {
      reset({
        campaignId: id,
        title: campaign.title || "",
        description: campaign.description || "",
        instructions: (campaign.instructions || []).map((i) => ({
          instruction: i,
        })) || [{ instruction: "" }],
        requirements: (campaign.requirements || []).map((r) => ({
          requirement: r,
        })) || [{ requirement: "" }],
        estimatedTimeMinutes: campaign.estimatedTimeMinutes ?? 0,
        expiryDate: campaign.expiryDate
          ? new Date(campaign.expiryDate)
          : new Date(),
        bannerImageUrl: campaign.bannerImageUrl || "",
        activity: campaign.activity,
      } as UpdateCampaignActivityData);
      setBannerImageUrl(campaign.bannerImageUrl || null);
    }
  }, [campaign, reset, id]);

  if (user && user.advertiserRequestStatus !== STATUS_ENUM.APPROVED)
    return null;

  const watched = watch();

  const onSubmit = (data: UpdateCampaignActivityData) => {
    updateMutation.mutate({ ...data, campaignId: id });
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <BreadcrumbResponsive />
          <div>
            <h1 className="text-3xl font-bold">Edit Campaign</h1>
            <p className="text-muted-foreground mt-1">Update your campaign</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card className="shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Update essential details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="pb-2 ">
                      Campaign Name
                    </Label>
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id="title" disabled={isLoading} />
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
                          rows={3}
                          disabled={isLoading}
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

              <Card className="shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle>Campaign Banner</CardTitle>
                  <CardDescription>Update your banner image</CardDescription>
                </CardHeader>
                <CardContent>
                  <ImageUploader
                    onUploadSuccess={(url) => {
                      setBannerImageUrl(url);
                      setValue("bannerImageUrl", url as unknown as never, {
                        shouldValidate: true,
                      });
                    }}
                    onUploadError={(error) => {
                      console.error(error);
                    }}
                    currentImageUrl={bannerImageUrl || undefined}
                    onRemove={() => {
                      setBannerImageUrl(null);
                      setValue("bannerImageUrl", "" as unknown as never, {
                        shouldValidate: true,
                      });
                    }}
                    accept="image/*"
                    maxSize={5}
                    nameToUse={`campaign-banner-${Date.now()}-${watched.title || ""}`}
                    folderToUse="/kuditask/campaigns/banners"
                  />
                </CardContent>
              </Card>

              <Card className="shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>
                    Instructions and requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Step-by-Step Instructions</Label>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => appendInstruction({ instruction: "" })}
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4 " />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {instructionFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
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
                                disabled={isLoading}
                              />
                            )}
                          />
                          {instructionFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeInstruction(index)}
                              disabled={isLoading}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.instructions && (
                      <p className="text-sm text-red-500">
                        {errors.instructions.message as string}
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
                        disabled={isLoading}
                      >
                        <Plus className="h-4 w-4" />
                        Add Requirement
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {requirementFields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                          <Controller
                            name={`requirements.${index}.requirement`}
                            control={control}
                            render={({ field }) => (
                              <Input
                                {...field}
                                placeholder={`Requirement ${index + 1}...`}
                                className="flex-1"
                                disabled={isLoading}
                              />
                            )}
                          />
                          {requirementFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRequirement(index)}
                              disabled={isLoading}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {errors.requirements && (
                      <p className="text-sm text-red-500">
                        {errors.requirements.message as string}
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
                            disabled={isLoading}
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
                            fromDate={new Date()}
                            error={errors.expiryDate?.message}
                            disabled={isLoading}
                          />
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-4">
                <Link href={`/advertisers/campaigns/${id}`}>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={updateMutation.isPending}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!isValid || updateMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {updateMutation.isPending
                    ? "Saving Changes..."
                    : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card className="shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Preview
                  </CardTitle>
                  <CardDescription>
                    How your updated campaign will appear
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
                      {watched.title || "Campaign Name"}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {watched.description ||
                      "Campaign description will appear here..."}
                  </p>

                  {watched.instructions && watched.instructions.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Instructions:
                      </h4>
                      <ol className="text-sm space-y-1">
                        {watched.instructions.map((instruction, index) => (
                          <li
                            key={`${instruction.instruction}-${index}`}
                            className="flex gap-2"
                          >
                            <span className="text-muted-foreground">
                              {index + 1}.
                            </span>
                            <span>{instruction.instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {campaign?.payoutPerUser && campaign.payoutPerUser > 0
                          ? formatCurrency(campaign.payoutPerUser)
                          : "₦0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{campaign?.maxUsers || 0} spots</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{watched.estimatedTimeMinutes || 0}min</span>
                    </div>
                  </div>

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
    </div>
  );
}
