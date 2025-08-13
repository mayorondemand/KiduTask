"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
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
  Building2,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Generate mock advertiser data
const generateMockAdvertisers = () => {
  const statuses = ["active", "pending", "suspended", "rejected"];
  const industries = [
    "Technology",
    "E-commerce",
    "Finance",
    "Healthcare",
    "Education",
    "Entertainment",
  ];
  const advertisers = [];

  for (let i = 1; i <= 89; i++) {
    const status = statuses[i % 4];
    const industry = industries[i % 6];

    advertisers.push({
      id: `advertiser-${i}`,
      companyName: `Company ${i}`,
      contactName: `Contact Person ${i}`,
      email: `contact${i}@company${i}.com`,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=company${i}`,
      industry,
      status,
      totalSpent: Math.floor(Math.random() * 500000),
      activeCampaigns: Math.floor(Math.random() * 20),
      completedCampaigns: Math.floor(Math.random() * 50),
      averageRating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
      joinedAt: new Date(
        Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      lastActive: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
      ).toISOString(),
      phone: `+234${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      website: `https://company${i}.com`,
      description: `Leading ${industry.toLowerCase()} company focused on innovative solutions and customer satisfaction.`,
    });
  }

  return advertisers;
};

export default function AdminAdvertisersPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [allAdvertisers] = useState(generateMockAdvertisers());
  const [filteredAdvertisers, setFilteredAdvertisers] =
    useState(allAdvertisers);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [selectedAdvertiser, setSelectedAdvertiser] = useState(null);
  const [advertiserDetailsDialog, setAdvertiserDetailsDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login");
    }
  }, [user, router]);

  // Filter advertisers based on search and filters
  useEffect(() => {
    let filtered = allAdvertisers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (advertiser) =>
          advertiser.companyName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          advertiser.contactName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          advertiser.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (advertiser) => advertiser.status === statusFilter,
      );
    }

    // Industry filter
    if (industryFilter !== "all") {
      filtered = filtered.filter(
        (advertiser) => advertiser.industry === industryFilter,
      );
    }

    setFilteredAdvertisers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, industryFilter, allAdvertisers]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAdvertisers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAdvertisers = filteredAdvertisers.slice(startIndex, endIndex);

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
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "suspended":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
            Suspended
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getIndustryBadge = (industry) => {
    const colors = {
      Technology: "bg-blue-100 text-blue-800",
      "E-commerce": "bg-purple-100 text-purple-800",
      Finance: "bg-green-100 text-green-800",
      Healthcare: "bg-red-100 text-red-800",
      Education: "bg-orange-100 text-orange-800",
      Entertainment: "bg-pink-100 text-pink-800",
    };

    return (
      <Badge
        className={`${colors[industry] || "bg-gray-100 text-gray-800"} hover:${colors[industry] || "bg-gray-100"}`}
      >
        {industry}
      </Badge>
    );
  };

  const handleAdvertiserAction = async (advertiserId, action) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const actionMessages = {
      approve: "Advertiser has been approved",
      reject: "Advertiser has been rejected",
      suspend: "Advertiser has been suspended",
      activate: "Advertiser has been activated",
    };

    toast({
      title: "Action Completed",
      description: actionMessages[action] || "Action completed successfully",
    });

    setIsLoading(false);
  };

  const handleExportAdvertisers = () => {
    toast({
      title: "Export Started",
      description:
        "Advertiser data export has been initiated. You'll receive an email when ready.",
    });
  };

  const handleViewAdvertiser = (advertiser) => {
    setSelectedAdvertiser(advertiser);
    setAdvertiserDetailsDialog(true);
  };

  // Statistics
  const stats = {
    total: allAdvertisers.length,
    active: allAdvertisers.filter((a) => a.status === "active").length,
    pending: allAdvertisers.filter((a) => a.status === "pending").length,
    suspended: allAdvertisers.filter((a) => a.status === "suspended").length,
    rejected: allAdvertisers.filter((a) => a.status === "rejected").length,
  };

  const industries = [
    "Technology",
    "E-commerce",
    "Finance",
    "Healthcare",
    "Education",
    "Entertainment",
  ];

  const PaginationComponent = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to{" "}
        {Math.min(endIndex, filteredAdvertisers.length)} of{" "}
        {filteredAdvertisers.length} entries
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
          <h1 className="text-3xl font-bold text-gray-900">
            Advertiser Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage advertiser applications and accounts
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Advertisers
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
                <Clock className="h-8 w-8 text-yellow-600" />
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
                <AlertTriangle className="h-8 w-8 text-orange-600" />
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
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.rejected}
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
                    placeholder="Search advertisers..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={industryFilter}
                  onValueChange={setIndustryFilter}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleExportAdvertisers} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Advertisers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisers ({filteredAdvertisers.length})</CardTitle>
            <CardDescription>
              Manage advertiser accounts and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Campaigns</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAdvertisers.map((advertiser) => (
                    <TableRow key={advertiser.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={advertiser.avatar || "/placeholder.svg"}
                              alt={advertiser.companyName}
                            />
                            <AvatarFallback>
                              {advertiser.companyName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {advertiser.companyName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {advertiser.contactName}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getIndustryBadge(advertiser.industry)}
                      </TableCell>
                      <TableCell>{getStatusBadge(advertiser.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">
                            {formatCurrency(advertiser.totalSpent)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {advertiser.activeCampaigns} active
                          </div>
                          <div className="text-muted-foreground">
                            {advertiser.completedCampaigns} completed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">
                            {advertiser.averageRating}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(advertiser.joinedAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewAdvertiser(advertiser)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {advertiser.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleAdvertiserAction(
                                    advertiser.id,
                                    "approve",
                                  )
                                }
                                disabled={isLoading}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleAdvertiserAction(
                                    advertiser.id,
                                    "reject",
                                  )
                                }
                                disabled={isLoading}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {advertiser.status === "active" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAdvertiserAction(advertiser.id, "suspend")
                              }
                              disabled={isLoading}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <AlertTriangle className="h-4 w-4" />
                            </Button>
                          )}
                          {advertiser.status === "suspended" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleAdvertiserAction(
                                  advertiser.id,
                                  "activate",
                                )
                              }
                              disabled={isLoading}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredAdvertisers.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No advertisers found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}

            {filteredAdvertisers.length > 0 && <PaginationComponent />}
          </CardContent>
        </Card>

        {/* Advertiser Details Dialog */}
        <Dialog
          open={advertiserDetailsDialog}
          onOpenChange={setAdvertiserDetailsDialog}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Advertiser Details</DialogTitle>
              <DialogDescription>
                Detailed information about the advertiser
              </DialogDescription>
            </DialogHeader>
            {selectedAdvertiser && (
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedAdvertiser.avatar || "/placeholder.svg"}
                      alt={selectedAdvertiser.companyName}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedAdvertiser.companyName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedAdvertiser.companyName}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedAdvertiser.email}
                    </p>
                    <div className="flex space-x-2 mt-2">
                      {getStatusBadge(selectedAdvertiser.status)}
                      {getIndustryBadge(selectedAdvertiser.industry)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Contact Person:</strong>{" "}
                        {selectedAdvertiser.contactName}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedAdvertiser.phone}
                      </p>
                      <p>
                        <strong>Website:</strong> {selectedAdvertiser.website}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Account Information</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Joined:</strong>{" "}
                        {formatDate(selectedAdvertiser.joinedAt)}
                      </p>
                      <p>
                        <strong>Last Active:</strong>{" "}
                        {formatDate(selectedAdvertiser.lastActive)}
                      </p>
                      <p>
                        <strong>Rating:</strong>{" "}
                        {selectedAdvertiser.averageRating}/5.0
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Company Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAdvertiser.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Financial Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Total Spent:</strong>{" "}
                        {formatCurrency(selectedAdvertiser.totalSpent)}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Campaign Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>Active Campaigns:</strong>{" "}
                        {selectedAdvertiser.activeCampaigns}
                      </p>
                      <p>
                        <strong>Completed Campaigns:</strong>{" "}
                        {selectedAdvertiser.completedCampaigns}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setAdvertiserDetailsDialog(false)}
              >
                Close
              </Button>
              <Link href={`/admin/advertisers/${selectedAdvertiser?.id}`}>
                <Button>View Full Profile</Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
