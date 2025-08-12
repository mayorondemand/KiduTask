"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import {
  Settings,
  User,
  Shield,
  CreditCard,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Lock,
  FileText,
} from "lucide-react"
import { useState } from "react"

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  address: z.string().min(5, "Please enter a valid address").optional(),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

const bankAccountSchema = z.object({
  accountName: z.string().min(2, "Account name is required"),
  accountNumber: z.string().min(10, "Account number must be at least 10 digits"),
  bankName: z.string().min(2, "Bank name is required"),
  bankCode: z.string().min(3, "Bank code is required"),
})

const kycSchema = z.object({
  nin: z.string().min(11, "NIN must be 11 digits").max(11, "NIN must be 11 digits"),
  bvn: z.string().min(11, "BVN must be 11 digits").max(11, "BVN must be 11 digits"),
  idType: z.enum(["nin", "passport", "drivers_license", "voters_card"]),
  idNumber: z.string().min(5, "ID number is required"),
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>
type BankAccountForm = z.infer<typeof bankAccountSchema>
type KYCForm = z.infer<typeof kycSchema>

interface SettingsData {
  profile: {
    id: string
    name: string
    email: string
    phone?: string
    address?: string
    avatar?: string
    role: string
  }
  security: {
    twoFactorEnabled: boolean
    loginAlerts: boolean
    sessionTimeout: number
    lastPasswordChange: string
    trustedDevices: Array<{
      id: string
      name: string
      lastUsed: string
      location: string
    }>
  }
  banking: {
    bankAccount?: {
      accountName: string
      accountNumber: string
      bankName: string
      bankCode: string
      isVerified: boolean
    }
    kycStatus: "not_started" | "pending" | "verified" | "rejected"
    kycData?: {
      nin?: string
      bvn?: string
      idType?: string
      idNumber?: string
      documents: Array<{
        type: string
        url: string
        status: "pending" | "approved" | "rejected"
      }>
    }
  }
}

const fetchSettingsData = async (): Promise<SettingsData> => {
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return {
    profile: {
      id: "1",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+234 801 234 5678",
      address: "123 Lagos Street, Victoria Island, Lagos",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
      role: "tasker",
    },
    security: {
      twoFactorEnabled: false,
      loginAlerts: true,
      sessionTimeout: 30,
      lastPasswordChange: "2024-01-01T00:00:00Z",
      trustedDevices: [
        {
          id: "1",
          name: "iPhone 14 Pro",
          lastUsed: "2024-01-16T10:30:00Z",
          location: "Lagos, Nigeria",
        },
        {
          id: "2",
          name: "MacBook Pro",
          lastUsed: "2024-01-15T14:20:00Z",
          location: "Lagos, Nigeria",
        },
      ],
    },
    banking: {
      bankAccount: {
        accountName: "John Doe",
        accountNumber: "1234567890",
        bankName: "First Bank",
        bankCode: "011",
        isVerified: true,
      },
      kycStatus: "pending",
      kycData: {
        nin: "12345678901",
        bvn: "12345678901",
        idType: "nin",
        idNumber: "12345678901",
        documents: [
          {
            type: "nin_slip",
            url: "/documents/nin-slip.pdf",
            status: "pending",
          },
          {
            type: "utility_bill",
            url: "/documents/utility-bill.pdf",
            status: "approved",
          },
        ],
      },
    },
  }
}

const updateProfile = async (data: ProfileForm) => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return { success: true }
}

const changePassword = async (data: PasswordForm) => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return { success: true }
}

const updateBankAccount = async (data: BankAccountForm) => {
  await new Promise((resolve) => setTimeout(resolve, 3000))
  return { success: true }
}

const submitKYC = async (data: KYCForm) => {
  await new Promise((resolve) => setTimeout(resolve, 5000))
  return { success: true }
}

const updateSecuritySetting = async (setting: string, value: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return { success: true }
}

export default function SettingsPage() {
  const { user } = useAuth()
  
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState("profile")

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettingsData,
  })

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    },
  })

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully.",
      })
      resetPassword()
    },
    onError: () => {
      toast({
        title: "Password Change Failed",
        description: "There was an error changing your password. Please try again.",
        variant: "destructive",
      })
    },
  })

  const bankMutation = useMutation({
    mutationFn: updateBankAccount,
    onSuccess: () => {
      toast({
        title: "Bank Account Updated",
        description: "Your bank account details have been updated and are being verified.",
      })
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your bank account. Please try again.",
        variant: "destructive",
      })
    },
  })

  const kycMutation = useMutation({
    mutationFn: submitKYC,
    onSuccess: () => {
      toast({
        title: "KYC Submitted",
        description: "Your KYC information has been submitted for review. You'll be notified once approved.",
      })
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: () => {
      toast({
        title: "KYC Submission Failed",
        description: "There was an error submitting your KYC. Please try again.",
        variant: "destructive",
      })
    },
  })

  const securityMutation = useMutation({
    mutationFn: ({ setting, value }: { setting: string; value: any }) => updateSecuritySetting(setting, value),
    onSuccess: () => {
      toast({
        title: "Security Setting Updated",
        description: "Your security setting has been updated successfully.",
      })
      queryClient.invalidateQueries({ queryKey: ["settings"] })
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "There was an error updating your security setting. Please try again.",
        variant: "destructive",
      })
    },
  })

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: settings?.profile.name || "",
      email: settings?.profile.email || "",
      phone: settings?.profile.phone || "",
      address: settings?.profile.address || "",
    },
  })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const {
    register: registerBank,
    handleSubmit: handleBankSubmit,
    formState: { errors: bankErrors },
  } = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      accountName: settings?.banking.bankAccount?.accountName || "",
      accountNumber: settings?.banking.bankAccount?.accountNumber || "",
      bankName: settings?.banking.bankAccount?.bankName || "",
      bankCode: settings?.banking.bankAccount?.bankCode || "",
    },
  })

  const {
    register: registerKYC,
    handleSubmit: handleKYCSubmit,
    formState: { errors: kycErrors },
  } = useForm<KYCForm>({
    resolver: zodResolver(kycSchema),
    defaultValues: {
      nin: settings?.banking.kycData?.nin || "",
      bvn: settings?.banking.kycData?.bvn || "",
      idType: (settings?.banking.kycData?.idType as any) || "nin",
      idNumber: settings?.banking.kycData?.idNumber || "",
    },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    await updateProfileMutation.mutateAsync(data)
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    await passwordMutation.mutateAsync(data)
  }

  const onBankSubmit = async (data: BankAccountForm) => {
    await bankMutation.mutateAsync(data)
  }

  const onKYCSubmit = async (data: KYCForm) => {
    await kycMutation.mutateAsync(data)
  }

  const updateSecurity = (setting: string, value: any) => {
    securityMutation.mutate({ setting, value })
  }

  const getKYCStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        )
    }
  }

  if (!user) return null

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Account Settings
            </h1>
            <p className="text-gray-600">Manage your profile, security, and banking information</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile Details
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="banking" className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2" />
                Banking & KYC
              </TabsTrigger>
            </TabsList>

            {/* Profile Details Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 mb-6">
                    <div className="relative">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={settings?.profile.avatar || "/placeholder.svg"}
                          alt={settings?.profile.name}
                        />
                        <AvatarFallback className="text-lg">{settings?.profile.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white"
                      >
                        <Camera className="h-3 w-3" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{settings?.profile.name}</h3>
                      <p className="text-muted-foreground">{settings?.profile.email}</p>
                      <Badge variant="secondary" className="mt-1">
                        {settings?.profile.role}
                      </Badge>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...registerProfile("name")} defaultValue={settings?.profile.name} />
                        {profileErrors.name && <p className="text-sm text-destructive">{profileErrors.name.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          {...registerProfile("email")}
                          defaultValue={settings?.profile.email}
                        />
                        {profileErrors.email && (
                          <p className="text-sm text-destructive">{profileErrors.email.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...registerProfile("phone")}
                          defaultValue={settings?.profile.phone}
                        />
                        {profileErrors.phone && (
                          <p className="text-sm text-destructive">{profileErrors.phone.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" {...registerProfile("address")} defaultValue={settings?.profile.address} />
                        {profileErrors.address && (
                          <p className="text-sm text-destructive">{profileErrors.address.message}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={!profileDirty || updateProfileMutation.isPending}>
                      {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lock className="h-5 w-5 mr-2" />
                    Change Password
                  </CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                        {passwordErrors.currentPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">{passwordErrors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={passwordMutation.isPending}>
                      {passwordMutation.isPending ? "Changing..." : "Change Password"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={settings?.security.twoFactorEnabled}
                      onCheckedChange={(checked) => updateSecurity("twoFactorEnabled", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Login Alerts</Label>
                      <p className="text-sm text-muted-foreground">Get notified of new login attempts</p>
                    </div>
                    <Switch
                      checked={settings?.security.loginAlerts}
                      onCheckedChange={(checked) => updateSecurity("loginAlerts", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out after inactivity</p>
                    </div>
                    <Select
                      value={settings?.security.sessionTimeout.toString()}
                      onValueChange={(value) => updateSecurity("sessionTimeout", Number.parseInt(value))}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Trusted Devices</CardTitle>
                  <CardDescription>Devices that have been authorized to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {settings?.security.trustedDevices.map((device) => (
                      <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Shield className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {device.location} • Last used {new Date(device.lastUsed).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="bg-transparent">
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Banking & KYC Tab */}
            <TabsContent value="banking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Bank Account Details
                    </div>
                    {settings?.banking.bankAccount?.isVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Add your bank account for withdrawals. Account will be verified via Flutterwave.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBankSubmit(onBankSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          {...registerBank("accountName")}
                          defaultValue={settings?.banking.bankAccount?.accountName}
                        />
                        {bankErrors.accountName && (
                          <p className="text-sm text-destructive">{bankErrors.accountName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          {...registerBank("accountNumber")}
                          defaultValue={settings?.banking.bankAccount?.accountNumber}
                        />
                        {bankErrors.accountNumber && (
                          <p className="text-sm text-destructive">{bankErrors.accountNumber.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          {...registerBank("bankName")}
                          defaultValue={settings?.banking.bankAccount?.bankName}
                        />
                        {bankErrors.bankName && (
                          <p className="text-sm text-destructive">{bankErrors.bankName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bankCode">Bank Code</Label>
                        <Input
                          id="bankCode"
                          {...registerBank("bankCode")}
                          defaultValue={settings?.banking.bankAccount?.bankCode}
                        />
                        {bankErrors.bankCode && (
                          <p className="text-sm text-destructive">{bankErrors.bankCode.message}</p>
                        )}
                      </div>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your bank account will be verified through Flutterwave for security purposes.
                      </AlertDescription>
                    </Alert>

                    <Button type="submit" disabled={bankMutation.isPending}>
                      {bankMutation.isPending ? "Updating..." : "Update Bank Account"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      KYC Verification
                    </div>
                    {getKYCStatusBadge(settings?.banking.kycStatus || "not_started")}
                  </CardTitle>
                  <CardDescription>
                    Complete your identity verification to enable withdrawals and access all features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {settings?.banking.kycStatus === "verified" ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your identity has been verified successfully. You can now withdraw funds and access all
                        features.
                      </AlertDescription>
                    </Alert>
                  ) : settings?.banking.kycStatus === "pending" ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your KYC verification is being reviewed. This usually takes 1-2 business days. You'll be
                        notified once approved.
                      </AlertDescription>
                    </Alert>
                  ) : settings?.banking.kycStatus === "rejected" ? (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        Your KYC verification was rejected. Please review your information and resubmit with correct
                        details.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form onSubmit={handleKYCSubmit(onKYCSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nin">NIN (National Identification Number)</Label>
                          <Input
                            id="nin"
                            placeholder="Enter your 11-digit NIN"
                            {...registerKYC("nin")}
                            defaultValue={settings?.banking.kycData?.nin}
                          />
                          {kycErrors.nin && <p className="text-sm text-destructive">{kycErrors.nin.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bvn">BVN (Bank Verification Number)</Label>
                          <Input
                            id="bvn"
                            placeholder="Enter your 11-digit BVN"
                            {...registerKYC("bvn")}
                            defaultValue={settings?.banking.kycData?.bvn}
                          />
                          {kycErrors.bvn && <p className="text-sm text-destructive">{kycErrors.bvn.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="idType">ID Type</Label>
                          <Select
                            value={settings?.banking.kycData?.idType}
                            onValueChange={(value) => registerKYC("idType").onChange({ target: { value } })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nin">National ID (NIN)</SelectItem>
                              <SelectItem value="passport">International Passport</SelectItem>
                              <SelectItem value="drivers_license">Driver's License</SelectItem>
                              <SelectItem value="voters_card">Voter's Card</SelectItem>
                            </SelectContent>
                          </Select>
                          {kycErrors.idType && <p className="text-sm text-destructive">{kycErrors.idType.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idNumber">ID Number</Label>
                          <Input
                            id="idNumber"
                            placeholder="Enter your ID number"
                            {...registerKYC("idNumber")}
                            defaultValue={settings?.banking.kycData?.idNumber}
                          />
                          {kycErrors.idNumber && (
                            <p className="text-sm text-destructive">{kycErrors.idNumber.message}</p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Document Upload</h4>
                        <p className="text-sm text-muted-foreground">
                          Please upload clear photos or scans of the following documents:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm font-medium mb-1">NIN Slip</div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Upload your NIN slip or certificate
                            </div>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Choose File
                            </Button>
                          </div>

                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                            <div className="text-sm font-medium mb-1">Utility Bill</div>
                            <div className="text-xs text-muted-foreground mb-3">
                              Recent utility bill (not older than 3 months)
                            </div>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Choose File
                            </Button>
                          </div>
                        </div>
                      </div>

                      <Alert>
                        <Shield className="h-4 w-4" />
                        <AlertDescription>
                          Your documents are encrypted and stored securely. We use this information only for identity
                          verification as required by Nigerian financial regulations.
                        </AlertDescription>
                      </Alert>

                      <Button type="submit" disabled={kycMutation.isPending} className="w-full">
                        {kycMutation.isPending ? "Submitting KYC..." : "Submit KYC Verification"}
                      </Button>
                    </form>
                  )}

                  {settings?.banking.kycData?.documents && settings.banking.kycData.documents.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-medium mb-4">Uploaded Documents</h4>
                      <div className="space-y-3">
                        {settings.banking.kycData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium capitalize">{doc.type.replace("_", " ")}</div>
                                <div className="text-sm text-muted-foreground">
                                  Status: {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                                </div>
                              </div>
                            </div>
                            <Badge
                              className={
                                doc.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : doc.status === "rejected"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
