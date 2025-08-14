"use client"

import type React from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, DollarSign, Users, Clock, Calculator, Eye, AlertCircle, Plus, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"

const PLATFORM_FEE = 10500 // Fixed platform fee in Naira

const campaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").min(3, "Campaign name must be at least 3 characters"),
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  instructions: z
    .array(z.string().min(1, "Instruction cannot be empty"))
    .min(1, "At least one instruction is required"),
  requirements: z.array(z.string()).optional(),
  payoutPerUser: z.number().min(10, "Minimum payout is ₦10").max(10000, "Maximum payout is ₦10,000"),
  maxUsers: z.number().min(1, "At least 1 user required").max(10000, "Maximum 10,000 users allowed"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  estimatedTimeMinutes: z.number().min(1, "Minimum 1 minute").max(120, "Maximum 120 minutes"),
  bannerImage: z.any().optional(),
})

type CampaignFormData = z.infer<typeof campaignSchema>

export default function NewCampaignPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dragActive, setDragActive] = useState(false)
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      description: "",
      instructions: [""],
      requirements: [""],
      payoutPerUser: 0,
      maxUsers: 0,
      expiryDate: "",
      estimatedTimeMinutes: 5,
      bannerImage: null,
    },
    mode: "onChange",
  })

  const {
    fields: instructionFields,
    append: appendInstruction,
    remove: removeInstruction,
  } = useFieldArray({
    control,
    name: "instructions",
  })

  const {
    fields: requirementFields,
    append: appendRequirement,
    remove: removeRequirement,
  } = useFieldArray({
    control,
    name: "requirements",
  })

  const watchedValues = watch()

  const createCampaignMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      return { success: true, campaignId: "123" }
    },
    onSuccess: () => {
      router.push("/advertisers/campaigns")
    },
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setValue("bannerImage", file)
        setBannerPreview(URL.createObjectURL(file))
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setValue("bannerImage", file)
      setBannerPreview(URL.createObjectURL(file))
    }
  }

  const removeBannerImage = () => {
    setValue("bannerImage", null)
    setBannerPreview(null)
  }

  const calculateTotalCost = () => {
    const subtotal = watchedValues.payoutPerUser * watchedValues.maxUsers
    return subtotal + PLATFORM_FEE
  }

  const onSubmit = (data: CampaignFormData) => {
    createCampaignMutation.mutate(data)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  // Get tomorrow's date as minimum date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split("T")[0]

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
          <div>
            <h1 className="text-3xl font-bold">Create New Campaign</h1>
            <p className="text-muted-foreground mt-1">Set up your campaign to reach thousands of potential customers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Provide the essential details about your campaign</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Campaign Name *</Label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id="name" placeholder="e.g., Instagram Follow Campaign" />
                      )}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Campaign Description *</Label>
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
                  </div>
                </CardContent>
              </Card>

              {/* Task Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Task Details</CardTitle>
                  <CardDescription>Specify the requirements and instructions for taskers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Step-by-Step Instructions *</Label>
                      <Button type="button" variant="outline" size="sm" onClick={() => appendInstruction("")}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Step
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {instructionFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <div className="flex-shrink-0 w-8 h-10 bg-primary text-primary-foreground rounded flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <Controller
                            name={`instructions.${index}`}
                            control={control}
                            render={({ field }) => (
                              <Input {...field} placeholder={`Step ${index + 1} instruction...`} className="flex-1" />
                            )}
                          />
                          {instructionFields.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeInstruction(index)}>
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
                      <Button type="button" variant="outline" size="sm" onClick={() => appendRequirement("")}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Requirement
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {requirementFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                          <Controller
                            name={`requirements.${index}`}
                            control={control}
                            render={({ field }) => (
                              <Input {...field} placeholder={`Requirement ${index + 1}...`} className="flex-1" />
                            )}
                          />
                          {requirementFields.length > 1 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => removeRequirement(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
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
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expiryDate">Campaign Expiry Date *</Label>
                      <Controller
                        name="expiryDate"
                        control={control}
                        render={({ field }) => <Input {...field} id="expiryDate" type="date" min={minDate} />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget & Targeting */}
              <Card>
                <CardHeader>
                  <CardTitle>Budget & Targeting</CardTitle>
                  <CardDescription>Set your budget and target audience size</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payoutPerUser">Payout Per User (₦) *</Label>
                      <Controller
                        name="payoutPerUser"
                        control={control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="payoutPerUser"
                            type="number"
                            min="10"
                            step="10"
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxUsers">Maximum Users *</Label>
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
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {watchedValues.payoutPerUser > 0 && watchedValues.maxUsers > 0 && (
                    <Alert>
                      <Calculator className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(watchedValues.payoutPerUser * watchedValues.maxUsers)}</span>
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
                  <CardTitle>Campaign Banner (Optional)</CardTitle>
                  <CardDescription>Upload an attractive banner image to make your campaign stand out</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {bannerPreview ? (
                      <div className="space-y-4">
                        <img
                          src={bannerPreview || "/placeholder.svg"}
                          alt="Campaign banner preview"
                          className="max-h-48 mx-auto rounded-lg"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-muted-foreground">Banner uploaded</span>
                          <Button type="button" variant="outline" size="sm" onClick={removeBannerImage}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div>
                          <p className="text-lg font-medium">Drop your banner image here</p>
                          <p className="text-sm text-muted-foreground">or click to browse (PNG, JPG up to 5MB)</p>
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
                  disabled={!isValid || createCampaignMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {createCampaignMutation.isPending ? "Creating Campaign..." : "Create Campaign"}
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
                  <CardDescription>How your campaign will appear to taskers</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bannerPreview && (
                    <img
                      src={bannerPreview || "/placeholder.svg"}
                      alt="Campaign banner"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">{watchedValues.name || "Campaign Name"}</h3>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {watchedValues.description || "Campaign description will appear here..."}
                  </p>

                  {watchedValues.instructions && watchedValues.instructions.some((inst) => inst.trim()) && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Instructions:</h4>
                      <ol className="text-sm space-y-1">
                        {watchedValues.instructions
                          .filter((inst) => inst.trim())
                          .map((instruction, index) => (
                            <li key={index} className="flex gap-2">
                              <span className="text-muted-foreground">{index + 1}.</span>
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
                        {watchedValues.payoutPerUser > 0 ? formatCurrency(watchedValues.payoutPerUser) : "₦0"}
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

                  {watchedValues.payoutPerUser > 0 && watchedValues.maxUsers > 0 && (
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="text-sm font-medium mb-1">Total Budget</div>
                      <div className="text-lg font-bold text-primary">{formatCurrency(calculateTotalCost())}</div>
                      <div className="text-xs text-muted-foreground">
                        Including ₦{PLATFORM_FEE.toLocaleString()} platform fee
                      </div>
                    </div>
                  )}

                  {!isValid && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please fill in all required fields to see the complete preview.
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
  )
}
