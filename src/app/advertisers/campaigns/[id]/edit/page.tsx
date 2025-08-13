"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  DollarSign,
  Users,
  Clock,
  Calculator,
  Eye,
  AlertCircle,
  Plus,
  X,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PLATFORM_FEE = 10500; // Fixed platform fee in Naira

// Mock campaign data (pre-filled for editing)
const mockCampaign = {
  id: "1",
  name: "Instagram Follow Campaign",
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
  expiryDate: "2024-01-22",
  estimatedTimeMinutes: 5,
  bannerImage: "/instagram-follow-campaign.png",
};

export default function EditCampaignPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: mockCampaign.name,
    description: mockCampaign.description,
    instructions: [...mockCampaign.instructions],
    requirements: [...mockCampaign.requirements],
    payoutPerUser: mockCampaign.payoutPerUser,
    maxUsers: mockCampaign.maxUsers,
    expiryDate: mockCampaign.expiryDate,
    estimatedTimeMinutes: mockCampaign.estimatedTimeMinutes,
    bannerImage: null as File | null,
    currentBannerUrl: mockCampaign.bannerImage,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!user?.isAdvertiser) {
      router.push("/home");
    }
  }, [user, router]);

  if (!user?.isAdvertiser) {
    return null;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addInstruction = () => {
    setFormData((prev) => ({
      ...prev,
      instructions: [...prev.instructions, ""],
    }));
  };

  const removeInstruction = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index),
    }));
  };

  const updateInstruction = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) =>
        i === index ? value : inst,
      ),
    }));
  };

  const addRequirement = () => {
    setFormData((prev) => ({
      ...prev,
      requirements: [...prev.requirements, ""],
    }));
  };

  const removeRequirement = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.map((req, i) =>
        i === index ? value : req,
      ),
    }));
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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({ ...prev, bannerImage: file }));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, bannerImage: e.target.files![0] }));
    }
  };

  const calculateTotalCost = () => {
    const subtotal = formData.payoutPerUser * formData.maxUsers;
    return subtotal + PLATFORM_FEE;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Campaign Updated! ✅",
        description: "Your campaign changes have been saved successfully.",
      });

      router.push(`/advertisers/campaigns/${params.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const isFormValid =
    formData.name &&
    formData.description &&
    formData.instructions.some((inst) => inst.trim()) &&
    formData.payoutPerUser > 0 &&
    formData.maxUsers > 0 &&
    formData.expiryDate;

  // Get tomorrow's date as minimum date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const currentBannerUrl = formData.bannerImage
    ? URL.createObjectURL(formData.bannerImage)
    : formData.currentBannerUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href={`/advertisers/campaigns/${params.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Campaign</h1>
            <p className="text-muted-foreground mt-1">
              Update your campaign details and settings
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Update the essential details about your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Instagram Follow Campaign"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Campaign Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what users need to do and why..."
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={3}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Task Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>
                    Update the requirements and instructions for taskers
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Step-by-Step Instructions *</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addInstruction}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.instructions.map((instruction, index) => (
                        <div key={index} className="flex gap-2">
                          <div className="flex-shrink-0 w-8 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <Input
                            placeholder={`Step ${index + 1} instruction...`}
                            value={instruction}
                            onChange={(e) =>
                              updateInstruction(index, e.target.value)
                            }
                            className="flex-1"
                          />
                          {formData.instructions.length > 1 && (
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
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Additional Requirements</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRequirement}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Requirement
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.requirements.map((requirement, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder={`Requirement ${index + 1}...`}
                            value={requirement}
                            onChange={(e) =>
                              updateRequirement(index, e.target.value)
                            }
                            className="flex-1"
                          />
                          {formData.requirements.length > 1 && (
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedTime">
                        Estimated Time (minutes)
                      </Label>
                      <Input
                        id="estimatedTime"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.estimatedTimeMinutes}
                        onChange={(e) =>
                          handleInputChange(
                            "estimatedTimeMinutes",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Campaign Expiry Date *</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        min={minDate}
                        value={formData.expiryDate}
                        onChange={(e) =>
                          handleInputChange("expiryDate", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Targeting</CardTitle>
                  <CardDescription>
                    Update your budget and target audience size
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payoutPerUser">
                        Payout Per User (₦) *
                      </Label>
                      <Input
                        id="payoutPerUser"
                        type="number"
                        min="10"
                        step="10"
                        value={formData.payoutPerUser}
                        onChange={(e) =>
                          handleInputChange(
                            "payoutPerUser",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxUsers">Maximum Users *</Label>
                      <Input
                        id="maxUsers"
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.maxUsers}
                        onChange={(e) =>
                          handleInputChange(
                            "maxUsers",
                            Number.parseInt(e.target.value) || 0,
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  {formData.payoutPerUser > 0 && formData.maxUsers > 0 && (
                    <Alert>
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>
                              {formatCurrency(
                                formData.payoutPerUser * formData.maxUsers,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Platform Fee:</span>
                            <span>{formatCurrency(PLATFORM_FEE)}</span>
                          </div>
                          <div className="flex justify-between font-semibold border-t pt-1">
                            <span>Total Cost:</span>
                            <span>{formatCurrency(calculateTotalCost())}</span>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Banner Image */}
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Banner</CardTitle>
                  <CardDescription>
                    Update your campaign banner image
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {currentBannerUrl ? (
                      <div className="space-y-4">
                        <img
                          src={currentBannerUrl || "/placeholder.svg"}
                          alt="Campaign banner preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formData.bannerImage
                              ? formData.bannerImage.name
                              : "Current banner"}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleInputChange("bannerImage", null)
                            }
                          >
                            {formData.bannerImage ? "Remove" : "Remove Current"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">
                            Drop your banner image here
                          </p>
                          <p className="text-sm text-muted-foreground">
                            or click to browse (PNG, JPG up to 5MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          id="banner-upload"
                        />
                        <label htmlFor="banner-upload">
                          <Button type="button" variant="outline" asChild>
                            <span>Choose File</span>
                          </Button>
                        </label>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link href={`/advertisers/campaigns/${params.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>
                    How your updated campaign will appear
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentBannerUrl && (
                    <img
                      src={currentBannerUrl || "/placeholder.svg"}
                      alt="Campaign banner"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">
                      {formData.name || "Campaign Name"}
                    </h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {formData.description ||
                      "Campaign description will appear here..."}
                  </p>

                  {formData.instructions.some((inst) => inst.trim()) && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        Instructions:
                      </h4>
                      <ol className="text-sm space-y-1">
                        {formData.instructions
                          .filter((inst) => inst.trim())
                          .map((instruction, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-muted-foreground">
                                {index + 1}.
                              </span>
                              <span>{instruction}</span>
                            </li>
                          ))}
                      </ol>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">
                        {formData.payoutPerUser > 0
                          ? formatCurrency(formData.payoutPerUser)
                          : "₦0"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{formData.maxUsers || 0} spots</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{formData.estimatedTimeMinutes || 0}min</span>
                    </div>
                  </div>

                  {formData.payoutPerUser > 0 && formData.maxUsers > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm font-medium mb-1">
                        Total Budget
                      </div>
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(calculateTotalCost())}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Including ₦{PLATFORM_FEE.toLocaleString()} platform fee
                      </div>
                    </div>
                  )}

                  {!isFormValid && (
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
