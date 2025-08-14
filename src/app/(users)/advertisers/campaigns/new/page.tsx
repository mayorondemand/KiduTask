"use client";

import type React from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Upload,
  DollarSign,
  Users,
  Clock,
  Calculator,
  Eye,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const taskTypes = [
  { value: "social_follow", label: "Social Media Follow", basePrice: 50 },
  { value: "social_like", label: "Social Media Like/Share", basePrice: 30 },
  { value: "app_review", label: "App Store Review", basePrice: 150 },
  { value: "survey", label: "Survey/Questionnaire", basePrice: 100 },
  { value: "content_creation", label: "Content Creation", basePrice: 300 },
  { value: "website_visit", label: "Website Visit/Signup", basePrice: 80 },
  { value: "video_watch", label: "Video Watch/Subscribe", basePrice: 60 },
  { value: "other", label: "Other", basePrice: 100 },
];

export default function NewCampaignPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    taskType: "",
    description: "",
    instructions: "",
    payoutPerUser: 0,
    maxUsers: 0,
    expiresInDays: 7,
    estimatedTimeMinutes: 5,
    requirements: "",
    bannerImage: null as File | null,
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

    // Auto-set payout when task type changes
    if (field === "taskType") {
      const taskType = taskTypes.find((t) => t.value === value);
      if (taskType) {
        setFormData((prev) => ({ ...prev, payoutPerUser: taskType.basePrice }));
      }
    }
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
    const platformFee = subtotal * 0.1; // 10% platform fee
    return subtotal + platformFee;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Campaign Created! 🎉",
        description:
          "Your campaign has been submitted for approval and will be live soon.",
      });

      router.push("/advertisers/campaigns");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
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
    formData.taskType &&
    formData.description &&
    formData.instructions &&
    formData.payoutPerUser > 0 &&
    formData.maxUsers > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/advertisers/campaigns">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Set up your campaign to reach thousands of potential customers
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
                  Provide the essential details about your campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Instagram Follow Campaign"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="taskType">Task Type *</Label>
                  <Select
                    value={formData.taskType}
                    onValueChange={(value) =>
                      handleInputChange("taskType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{type.label}</span>
                            <Badge variant="secondary" className="ml-2">
                              {formatCurrency(type.basePrice)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  Specify the requirements and instructions for taskers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="instructions">
                    Step-by-Step Instructions *
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="1. Go to our Instagram page @example&#10;2. Follow our account&#10;3. Like our latest post&#10;4. Take a screenshot as proof"
                    value={formData.instructions}
                    onChange={(e) =>
                      handleInputChange("instructions", e.target.value)
                    }
                    rows={6}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Additional Requirements</Label>
                  <Textarea
                    id="requirements"
                    placeholder="e.g., Must have active social media account, Must be 18+, etc."
                    value={formData.requirements}
                    onChange={(e) =>
                      handleInputChange("requirements", e.target.value)
                    }
                    rows={2}
                  />
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
                    <Label htmlFor="expiresIn">Campaign Duration (days)</Label>
                    <Select
                      value={formData.expiresInDays.toString()}
                      onValueChange={(value) =>
                        handleInputChange(
                          "expiresInDays",
                          Number.parseInt(value),
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budget & Targeting */}
            <Card>
              <CardHeader>
                <CardTitle>Budget & Targeting</CardTitle>
                <CardDescription>
                  Set your budget and target audience size
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payoutPerUser">Payout Per User (₦) *</Label>
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
                          <span>Platform Fee (10%):</span>
                          <span>
                            {formatCurrency(
                              formData.payoutPerUser * formData.maxUsers * 0.1,
                            )}
                          </span>
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
                <CardTitle>Campaign Banner (Optional)</CardTitle>
                <CardDescription>
                  Upload an attractive banner image to make your campaign stand
                  out
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
                  {formData.bannerImage ? (
                    <div className="space-y-4">
                      <img
                        src={
                          URL.createObjectURL(formData.bannerImage) ||
                          "/placeholder.svg"
                        }
                        alt="Campaign banner preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {formData.bannerImage.name}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange("bannerImage", null)}
                        >
                          Remove
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
              <Link href="/advertisers/campaigns">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
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
                  How your campaign will appear to taskers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.bannerImage && (
                  <img
                    src={
                      URL.createObjectURL(formData.bannerImage) ||
                      "/placeholder.svg"
                    }
                    alt="Campaign banner"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="font-semibold text-lg">
                    {formData.name || "Campaign Name"}
                  </h3>
                  {formData.taskType && (
                    <Badge variant="secondary" className="mt-1">
                      {
                        taskTypes.find((t) => t.value === formData.taskType)
                          ?.label
                      }
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {formData.description ||
                    "Campaign description will appear here..."}
                </p>

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
                    <div className="text-sm font-medium mb-1">Total Budget</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(calculateTotalCost())}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Including 10% platform fee
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
  );
}
