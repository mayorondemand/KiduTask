"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building, Globe, Star, Calendar, BarChart3 } from "lucide-react";
import Link from "next/link";
import { useAdvertiserDashboard, useUpdateBrandSettings } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import { BreadcrumbResponsive } from "@/components/layout/breadcrumbresponsive";
import { brandSettingsSchema, type BrandSettingsFormData } from "@/lib/types";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

export default function BrandSettingsPage() {
  const { user } = useAuth();
  const { data: advertiserStats } = useAdvertiserDashboard();
  const updateBrandSettings = useUpdateBrandSettings();

  const form = useForm<BrandSettingsFormData>({
    resolver: zodResolver(brandSettingsSchema),
    defaultValues: {
      brandName: user?.advertiserBrand || "",
      description: user?.advertiserDescription || "",
      website: user?.advertiserWebsite || "",
      logo: user?.advertiserLogo || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        brandName: user.advertiserBrand || "",
        description: user.advertiserDescription || "",
        website: user.advertiserWebsite || "",
        logo: user.advertiserLogo || "",
      });
    }
  }, [user, form.reset]);

  const { watch, setValue } = form;
  const watchedValues = watch();

  const handleLogoUpload = (url: string) => {
    setValue("logo", url);
  };

  const handleLogoRemove = () => {
    setValue("logo", "");
  };

  const onSubmit = async (data: BrandSettingsFormData) => {
    await updateBrandSettings.mutateAsync(data);
  };

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col  gap-4 mb-8">
          <BreadcrumbResponsive />
          <div>
            <h1 className="text-3xl font-bold">Brand Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your brand identity and information
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Brand Identity */}
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Identity</CardTitle>
                    <CardDescription>
                      Your brand's visual identity and basic information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Logo Upload */}
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Logo</FormLabel>
                          <FormControl>
                            <ImageUploader
                              nameToUse={`advertiser-logo-${Date.now()}-${watchedValues.brandName}`}
                              folderToUse="/kuditask/advertisers/logo"
                              onUploadSuccess={handleLogoUpload}
                              onRemove={handleLogoRemove}
                              currentImageUrl={field.value}
                              maxSize={2}
                              className="mt-2"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="brandName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your brand name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Brand Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Brand Information</CardTitle>
                    <CardDescription>
                      Tell taskers about your brand and what you do
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Description *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your brand, what you do, and what makes you unique..."
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website URL</FormLabel>
                          <FormControl>
                            <Input
                              type="url"
                              placeholder="https://yourwebsite.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <Link href="/advertisers">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={updateBrandSettings.isPending}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {updateBrandSettings.isPending
                      ? "Saving Changes..."
                      : "Save Changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Preview</CardTitle>
                <CardDescription>
                  How your brand appears to taskers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      className="object-cover"
                      src={watchedValues.logo}
                      alt={watchedValues.brandName}
                    />
                    <AvatarFallback>
                      <Building className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {watchedValues.brandName || "Brand Name"}
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {watchedValues.description ||
                    "Brand description will appear here..."}
                </p>

                {watchedValues.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a
                      href={watchedValues.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {watchedValues.website}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Brand Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Statistics</CardTitle>
                <CardDescription>Your performance on KudiTask</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Member Since</span>
                  </div>
                  <span className="font-medium">
                    {user?.createdAt?.toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Campaigns</span>
                  </div>
                  <span className="font-medium">
                    {advertiserStats?.totalCampaigns}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Spent This Month</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(advertiserStats?.totalSpentMonth)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">
                      {advertiserStats?.approvalRate}
                    </span>
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Brand Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p>
                    • <strong>Professional logo:</strong> Use a clear,
                    high-quality logo for better recognition
                  </p>
                  <p>
                    • <strong>Clear description:</strong> Explain what your
                    brand does and why taskers should work with you
                  </p>
                  <p>
                    • <strong>Complete profile:</strong> Fill out all fields to
                    build trust with taskers
                  </p>
                  <p>
                    • <strong>Stay active:</strong> Regular campaigns help
                    maintain brand visibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
