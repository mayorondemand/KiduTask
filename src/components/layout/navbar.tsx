"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAdvertiserRequest } from "@/lib/client";
import {
  BarChart3,
  Briefcase,
  Clock,
  LogOut,
  Menu,
  Settings,
  Star,
  Stars,
  User,
  Users2,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [advertiserDialogOpen, setAdvertiserDialogOpen] = useState(false);

  const advertiserRequestMutation = useAdvertiserRequest();

  const handleAdvertiserRequest = () => {
    advertiserRequestMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Your request has been sent to the admin for approval");
        setAdvertiserDialogOpen(false);
      },
      onError: () => {
        toast.error("Request Failed", {
          description:
            "There was an error processing your request. Please try again.",
        });
      },
    });
  };

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const NavLinks = () => {
    if (user.role === "admin") {
      return (
        <>
          <Link
            href="/admin"
            className="text-sm font-medium hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium hover:text-primary"
          >
            Users
          </Link>
          <Link
            href="/admin/campaigns"
            className="text-sm font-medium hover:text-primary"
          >
            Campaigns
          </Link>
          <Link
            href="/admin/reports"
            className="text-sm font-medium hover:text-primary"
          >
            Reports
          </Link>
        </>
      );
    }

    return (
      <>
        <Link href="/home" className="text-sm font-medium hover:text-primary">
          Home
        </Link>
        <Link
          href="/campaigns"
          className="text-sm font-medium hover:text-primary"
        >
          Campaigns
        </Link>
        <Link href="/wallet" className="text-sm font-medium hover:text-primary">
          Wallet
        </Link>
        {user.advertiserRequestStatus === "approved" && (
          <Link
            href="/advertisers"
            className="text-sm font-medium hover:text-primary"
          >
            Advertiser
          </Link>
        )}
      </>
    );
  };

  return (
    <nav className="sticky top-2 z-50 ">
      <div className="container bg-white rounded-full border border-gray-200 mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/home" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  KT
                </span>
              </div>
              <span className="font-semibold text-lg">KudiTask</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <NavLinks />
            </div>
          </div>

          {/* Wallet */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-medium">
                {formatCurrency(user.walletBalance)}
              </span>
            </div>

            {/* Show different buttons based on advertiser status */}
            {user.advertiserRequestStatus !== "approved" && (
              <Dialog
                open={advertiserDialogOpen}
                onOpenChange={setAdvertiserDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0">
                    <Stars className="h-4 w-4" />
                    <span className="font-medium">Become Advertiser</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center text-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mr-3">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      Become an Advertiser
                    </DialogTitle>
                    <DialogDescription>
                      Unlock powerful tools to grow your business and reach
                      thousands of potential customers.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="py-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Zap className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-blue-900">
                            Instant Reach
                          </div>
                          <div className="text-xs text-blue-700">
                            Access 10k+ active users
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <BarChart3 className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-green-900">
                            Real Analytics
                          </div>
                          <div className="text-xs text-green-700">
                            Track every campaign
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users2 className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-purple-900">
                            Quality Users
                          </div>
                          <div className="text-xs text-purple-700">
                            KYC verified taskers
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg text-center">
                          <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-orange-900">
                            Easy Setup
                          </div>
                          <div className="text-xs text-orange-700">
                            Launch in minutes
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-lg text-white text-center">
                        <div className="text-lg font-bold">
                          🚀 Start Growing Today
                        </div>
                        <div className="text-sm opacity-90">
                          Join 500+ businesses already using KudiTask
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAdvertiserDialogOpen(false)}
                      className="bg-transparent w-full sm:w-auto"
                      disabled={advertiserRequestMutation.isPending}
                    >
                      Maybe Later
                    </Button>
                    {user.advertiserRequestStatus === "pending" ||
                    advertiserRequestMutation.isSuccess ? (
                      <Button
                        variant={"secondary"}
                        className="bg-yellow-200 text-yellow-800 w-full sm:w-auto"
                      >
                        <Clock className="h-4 w-4" />
                        Awaiting Approval
                      </Button>
                    ) : (
                      <Button
                        onClick={handleAdvertiserRequest}
                        disabled={advertiserRequestMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 w-full sm:w-auto"
                      >
                        {advertiserRequestMutation.isPending
                          ? "Setting up your account..."
                          : "Become Advertiser"}
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {user.advertiserRequestStatus === "approved" && (
              <Link href="/advertisers">
                <Button className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg">
                  <BarChart3 className="h-4 w-4" />
                  <span className="font-medium">Advertiser Dashboard</span>
                </Button>
              </Link>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.image || ""} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex gap-1">
                      <Badge variant="secondary" className="capitalize w-fit">
                        {user.role}
                      </Badge>
                      {user.advertiserRequestStatus === "approved" && (
                        <Badge
                          variant="outline"
                          className="w-fit text-purple-600 border-purple-600"
                        >
                          Advertiser
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role !== "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/wallet">
                      <Wallet className="mr-2 h-4 w-4" />
                      Wallet
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.advertiserRequestStatus === "approved" && (
                  <DropdownMenuItem asChild>
                    <Link href="/advertisers">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Advertiser Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logoutMutation.mutate}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
