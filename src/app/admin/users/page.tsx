"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/admin-auth-provider";
import { Navbar } from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Search,
  Download,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Wallet,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Generate mock user data
const generateMockUsers = () => {
  const statuses = ["active", "suspended", "pending", "banned"];
  const userTypes = ["tasker", "advertiser", "both"];
  const users = [];

  for (let i = 1; i <= 127; i++) {
    const userType = userTypes[i % 3];
    const status = statuses[i % 4];
    const kycStatus =
      i % 5 === 0 ? "pending" : i % 7 === 0 ? "rejected" : "verified";

    users.push({
      id: `user-${i}`,
      name: `User ${i}`,
      email: `user${i}@example.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`,
      userType,
      status,
      kycStatus,
      walletBalance: Math.floor(Math.random() * 50000),
      totalEarnings: Math.floor(Math.random() * 100000),
      completedTasks: Math.floor(Math.random() * 50),
      createdCampaigns:
        userType === "advertiser" || userType === "both"
          ? Math.floor(Math.random() * 10)
          : 0,
      joinedAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastActive: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      location: ["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"][
        Math.floor(Math.random() * 5)
      ],
    });
  }

  return users;
};

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [allUsers] = useState(generateMockUsers());
  const [filteredUsers, setFilteredUsers] = useState(allUsers);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [userTypeFilter, setUserTypeFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetailsDialog, setUserDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = allUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    // User type filter
    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.userType === userTypeFilter);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, userTypeFilter, allUsers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Suspended
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Pending
          </Badge>
        );
      case "banned":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Banned
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getKYCBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getUserTypeBadge = (type) => {
    switch (type) {
      case "tasker":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Tasker
          </Badge>
        );
      case "advertiser":
        return (
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Advertiser
          </Badge>
        );
      case "both":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Both
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const handleUserAction = async (userId, action) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const actionMessages = {
      suspend: "User has been suspended",
      activate: "User has been activated",
      ban: "User has been banned",
      verify: "User KYC has been verified",
    };

    toast({
      title: "Action Completed",
      description: actionMessages[action] || "Action completed successfully",
    });

    setIsLoading(false);
  };

  const handleExportUsers = () => {
    toast({
      title: "Export Started",
      description:
        "User data export has been initiated. You'll receive an email when ready.",
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDetailsDialog(true);
  };

  // Statistics
  const stats = {
    total: allUsers.length,
    active: allUsers.filter((u) => u.status === "active").length,
    suspended: allUsers.filter((u) => u.status === "suspended").length,
    pending: allUsers.filter((u) => u.status === "pending").length,
    banned: allUsers.filter((u) => u.status === "banned").length,
  };

  const PaginationComponent = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)}{" "}
        of {filteredUsers.length} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                className="w-8 h-8 p-0"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage platform users and their activities
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Suspended</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.suspended}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserX className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Banned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.banned}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userTypeFilter}
                  onValueChange={setUserTypeFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="User Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="tasker">Tasker</SelectItem>
                    <SelectItem value="advertiser">Advertiser</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExportUsers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>Manage and monitor user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>KYC</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserTypeBadge(user.userType)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{getKYCBadge(user.kycStatus)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Wallet className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(user.walletBalance)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(user.joinedAt)}</TableCell>
                      <TableCell>{formatDate(user.lastActive)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.status === "active" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleUserAction(user.id, "suspend")
                              }
                              disabled={isLoading}
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleUserAction(user.id, "activate")
                              }
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUserAction(user.id, "ban")}
                            disabled={isLoading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {filteredUsers.length > 0 && <PaginationComponent />}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={userDetailsDialog} onOpenChange={setUserDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
              <DialogDescription>
                Detailed information about the user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedUser.avatar || "/placeholder.svg"}
                      alt={selectedUser.name}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedUser.name}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedUser.email}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {getStatusBadge(selectedUser.status)}
                      {getUserTypeBadge(selectedUser.userType)}
                      {getKYCBadge(selectedUser.kycStatus)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Phone:</strong> {selectedUser.phone}
                      </p>
                      <p>
                        <strong>Location:</strong> {selectedUser.location}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Joined:</strong>{" "}
                        {formatDate(selectedUser.joinedAt)}
                      </p>
                      <p>
                        <strong>Last Active:</strong>{" "}
                        {formatDate(selectedUser.lastActive)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Financial Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Wallet Balance:</strong>{" "}
                        {formatCurrency(selectedUser.walletBalance)}
                      </p>
                      <p>
                        <strong>Total Earnings:</strong>{" "}
                        {formatCurrency(selectedUser.totalEarnings)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Activity Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Completed Tasks:</strong>{" "}
                        {selectedUser.completedTasks}
                      </p>
                      <p>
                        <strong>Created Campaigns:</strong>{" "}
                        {selectedUser.createdCampaigns}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setUserDetailsDialog(false)}
              >
                Close
              </Button>
              <Link href={`/admin/users/${selectedUser?.id}`}>
                <Button>View Full Profile</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
