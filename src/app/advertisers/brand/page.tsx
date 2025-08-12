"use client"

import type React from "react"

import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, Building, Globe, Star, Calendar, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const industries = [
  "Technology",
  "E-commerce",
  "Healthcare",
  "Finance",
  "Education",
  "Entertainment",
  "Food & Beverage",
  "Fashion",
  "Travel",
  "Real Estate",
  "Automotive",
  "Other",
]

export default function BrandSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  

  const [formData, setFormData] = useState({
    brandName: "TechStartup Inc",
    industry: "Technology",
    description:
      "Innovative technology solutions for modern businesses. We specialize in creating cutting-edge software and digital experiences.",
    website: "https://techstartup.com",
    logo: null as File | null,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!user?.isAdvertiser) {
      router.push("/home")
    }
  }, [user, router])

  if (!user?.isAdvertiser) {
    return null
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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
        setFormData((prev) => ({ ...prev, logo: file }))
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, logo: e.target.files![0] }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Brand Settings Updated! ✨",
        description: "Your brand information has been successfully updated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update brand settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const mockStats = {
    memberSince: "January 2024",
    totalCampaigns: 12,
    totalSpent: 127500,
    averageRating: 4.8,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/advertisers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Brand Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your brand identity and information</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Brand Identity */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Identity</CardTitle>
                  <CardDescription>Your brand's visual identity and basic information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <Label>Brand Logo</Label>
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mt-2 ${
                        dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {formData.logo ? (
                        <div className="space-y-4">
                          <img
                            src={URL.createObjectURL(formData.logo) || "/placeholder.svg"}
                            alt="Brand logo preview"
                            className="max-h-32 mx-auto rounded-lg"
                          />
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-sm text-muted-foreground">{formData.logo.name}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleInputChange("logo", null)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-medium">Drop your logo here</p>
                            <p className="text-sm text-muted-foreground">or click to browse (PNG, JPG up to 2MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="logo-upload"
                          />
                          <label htmlFor="logo-upload">
                            <Button type="button" variant="outline" size="sm" asChild>
                              <span>Choose File</span>
                            </Button>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="brandName">Brand Name *</Label>
                      <Input
                        id="brandName"
                        value={formData.brandName}
                        onChange={(e) => handleInputChange("brandName", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={formData.industry} onValueChange={(value) => handleInputChange("industry", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Brand Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Information</CardTitle>
                  <CardDescription>Tell taskers about your brand and what you do</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Brand Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your brand, what you do, and what makes you unique..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                    />
                  </div>
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
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isSubmitting ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Brand Preview</CardTitle>
                <CardDescription>How your brand appears to taskers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        formData.logo
                          ? URL.createObjectURL(formData.logo)
                          : "https://api.dicebear.com/7.x/initials/svg?seed=" + formData.brandName
                      }
                      alt={formData.brandName}
                    />
                    <AvatarFallback>
                      <Building className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{formData.brandName || "Brand Name"}</h3>
                    <Badge variant="secondary">{formData.industry}</Badge>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  {formData.description || "Brand description will appear here..."}
                </p>

                {formData.website && (
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4" />
                    <a
                      href={formData.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {formData.website}
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
                  <span className="font-medium">{mockStats.memberSince}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Campaigns</span>
                  </div>
                  <span className="font-medium">{mockStats.totalCampaigns}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <span className="font-medium">{formatCurrency(mockStats.totalSpent)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Average Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{mockStats.averageRating}</span>
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
                    • <strong>Professional logo:</strong> Use a clear, high-quality logo for better recognition
                  </p>
                  <p>
                    • <strong>Clear description:</strong> Explain what your brand does and why taskers should work with
                    you
                  </p>
                  <p>
                    • <strong>Complete profile:</strong> Fill out all fields to build trust with taskers
                  </p>
                  <p>
                    • <strong>Stay active:</strong> Regular campaigns help maintain brand visibility
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
