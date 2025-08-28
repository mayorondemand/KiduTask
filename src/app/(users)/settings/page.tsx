"use client";

import { usePublicAuth } from "@/components/providers/public-auth-provider";
import { StatusBadge } from "@/components/status-icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageUploader } from "@/components/ui/image-uploader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useUpdateBankAccount,
  useUpdateKycDetails,
  useUpdateProfile,
} from "@/lib/client";
import {
  updateBankAccountSchema,
  updateKycDetailsSchema,
  updateProfileSchema,
  type UpdateBankAccountData,
  type UpdateKycDetailsData,
  type UpdateProfileData,
} from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  FileText,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function SettingsPage() {
  const { user } = usePublicAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const updateProfileMutation = useUpdateProfile();

  const bankMutation = useUpdateBankAccount();

  const kycMutation = useUpdateKycDetails();

  const {
    reset: resetProfileForm,
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue,
    watch: watchProfileForm,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: "",
      image: "",
      phoneNumber: "",
      address: "",
    },
  });

  const {
    reset: resetBankForm,
    register: registerBank,
    handleSubmit: handleBankSubmit,
    formState: { errors: bankErrors },
  } = useForm<UpdateBankAccountData>({
    resolver: zodResolver(updateBankAccountSchema),
    defaultValues: {
      bankAccountName: user?.bankAccountName || "",
      bankAccountNumber: user?.bankAccountNumber || "",
      bankName: user?.bankName || "",
    },
  });

  const {
    register: registerKYC,
    reset: resetKYCForm,
    setValue: setKYCValue,
    handleSubmit: handleKYCSubmit,
    formState: { errors: kycErrors },
    watch: watchKYCForm,
  } = useForm<UpdateKycDetailsData>({
    resolver: zodResolver(updateKycDetailsSchema),
    defaultValues: {
      idType: "national_id",
      idNumber: user?.kycIdNumber || "",
      idUrl: user?.kycIdUrl || "",
    },
  });

  const newProfileUrl = watchProfileForm().image;
  const newKYCUrl = watchKYCForm().idUrl;

  const onProfileSubmit = async (data: UpdateProfileData) => {
    await updateProfileMutation.mutateAsync(data);
  };

  const onBankSubmit = async (data: UpdateBankAccountData) => {
    await bankMutation.mutateAsync(data);
  };

  const onKYCSubmit = async (data: UpdateKycDetailsData) => {
    await kycMutation.mutateAsync(data);
  };

  useEffect(() => {
    //Reset form on user load
    if (user) {
      resetProfileForm({
        name: user.name,
        image: user.image || undefined,
        phoneNumber: user.phoneNumber ?? "",
        address: user.address ?? "",
      });

      resetBankForm({
        bankAccountName: user.bankAccountName,
        bankAccountNumber: user.bankAccountNumber,
        bankName: user.bankName,
      });

      resetKYCForm({
        idNumber: user.kycIdNumber,
        idType: user.kycIdType ?? "national_id",
        idUrl: user.kycIdUrl,
      });
    }
  }, [user, resetProfileForm, resetBankForm, resetKYCForm]);

  return (
    <div className="min-h-screen pt-20 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
              <Settings className="h-8 w-8 mr-3" />
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your profile, and banking information
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                Profile Details
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
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={newProfileUrl || user?.image || ""} />
                      <AvatarFallback>
                        {(user?.name?.[0] || "U").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline">Change Photo</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update profile picture</DialogTitle>
                        </DialogHeader>
                        <ImageUploader
                          nameToUse={`user-${user?.id}-${new Date()}`}
                          folderToUse="/kuditask/profile-images"
                          currentImageUrl={""}
                          onUploadSuccess={(url: string) => {
                            setValue("image", url, { shouldDirty: true });
                          }}
                          onRemove={() => {
                            setValue("image", undefined);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>

                  <form
                    onSubmit={handleProfileSubmit(onProfileSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          {...registerProfile("name")}
                          defaultValue={user?.name || ""}
                        />
                        {profileErrors.name && (
                          <p className="text-sm text-destructive">
                            {profileErrors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ""}
                          disabled
                          readOnly
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          {...registerProfile("phoneNumber")}
                          defaultValue={user?.phoneNumber || ""}
                        />
                        {profileErrors.phoneNumber && (
                          <p className="text-sm text-destructive">
                            {profileErrors.phoneNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                          id="address"
                          type="text"
                          {...registerProfile("address")}
                          defaultValue={user?.address || ""}
                        />
                        {profileErrors.address && (
                          <p className="text-sm text-destructive">
                            {profileErrors.address.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        !profileDirty || updateProfileMutation.isPending
                      }
                    >
                      {updateProfileMutation.isPending
                        ? "Updating..."
                        : "Update Profile"}
                    </Button>
                  </form>
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
                  </CardTitle>
                  <CardDescription>
                    Add your bank account for withdrawals.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form
                    onSubmit={handleBankSubmit(onBankSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="accountName">Account Name</Label>
                        <Input
                          id="accountName"
                          {...registerBank("bankAccountName")}
                          defaultValue={user?.bankAccountName || ""}
                        />
                        {bankErrors.bankAccountName && (
                          <p className="text-sm text-destructive">
                            {bankErrors.bankAccountName.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          {...registerBank("bankAccountNumber")}
                          defaultValue={user?.bankAccountNumber || ""}
                        />
                        {bankErrors.bankAccountNumber && (
                          <p className="text-sm text-destructive">
                            {bankErrors.bankAccountNumber.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          {...registerBank("bankName")}
                          defaultValue={user?.bankName || ""}
                        />
                        {bankErrors.bankName && (
                          <p className="text-sm text-destructive">
                            {bankErrors.bankName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button type="submit" disabled={bankMutation.isPending}>
                      {bankMutation.isPending
                        ? "Updating..."
                        : "Update Bank Account"}
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
                    <StatusBadge status={user?.kycStatus ?? ""} />
                  </CardTitle>
                  <CardDescription>
                    Complete your identity verification to enable withdrawals
                    and access all features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.kycStatus === "approved" ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your identity has been verified successfully. You can
                        now withdraw funds and access all features.
                      </AlertDescription>
                    </Alert>
                  ) : user?.kycStatus === "pending" ? (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your KYC verification is being reviewed. This usually
                        takes 1-2 business days. You'll be notified once
                        approved.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <form
                      onSubmit={handleKYCSubmit(onKYCSubmit)}
                      className="space-y-6"
                    >
                      {user?.kycStatus === "rejected" && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            Your KYC verification was rejected. Please review
                            your information and resubmit with correct details.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="idType">ID Type</Label>
                          <Select
                            defaultValue={user?.kycIdType ?? "national_id"}
                            onValueChange={(value) =>
                              registerKYC("idType").onChange({
                                target: { value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="national_id">NIN</SelectItem>
                              <SelectItem disabled value="bvn">
                                BVN
                              </SelectItem>
                              <SelectItem disabled value="drivers_license">
                                Driver's License
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {kycErrors.idType && (
                            <p className="text-sm text-destructive">
                              {kycErrors.idType.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="idNumber">ID Number</Label>
                          <Input
                            id="idNumber"
                            placeholder="Enter your ID number"
                            {...registerKYC("idNumber")}
                            defaultValue={user?.kycIdNumber || ""}
                          />
                          {kycErrors.idNumber && (
                            <p className="text-sm text-destructive">
                              {kycErrors.idNumber.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Document Upload</h4>
                        <p className="text-sm text-muted-foreground">
                          Upload a clear image of your selected ID document.
                        </p>
                        <ImageUploader
                          nameToUse={`kyc_${user?.id}`}
                          folderToUse="/kuditask/kyc-images"
                          currentImageUrl={newKYCUrl ?? ""}
                          onUploadSuccess={(url: string) =>
                            setKYCValue("idUrl", url, {
                              shouldDirty: true,
                            })
                          }
                        />
                        {kycErrors.idUrl && (
                          <p className="text-sm text-destructive">
                            {kycErrors.idUrl.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={kycMutation.isPending}
                        className="w-full"
                      >
                        {kycMutation.isPending
                          ? "Submitting KYC..."
                          : "Submit KYC Verification"}
                      </Button>
                    </form>
                  )}

                  {/* uploaded documents list removed for now */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
