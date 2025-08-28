"use client";

  import { useAdminAuth } from "@/components/providers/admin-auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CreditCard,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  DollarSign,
  Download,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
export default function AdminPayouts() {
  const { user } = useAdminAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock payout requests data
  const payouts = [
    {
      id: "payout-1",
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john.doe@email.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john-doe",
      },
      amount: 25000,
      fee: 100,
      netAmount: 24900,
      status: "pending",
      bankDetails: {
        accountName: "John Doe",
        accountNumber: "0123456789",
        bankName: "First Bank of Nigeria",
        bankCode: "011",
      },
      requestedAt: "2024-01-15T10:30:00Z",
      reference: "WTH-001-2024",
      reason: "Task earnings withdrawal",
    },
    {
      id: "payout-2",
      user: {
        id: "user-2",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-johnson",
      },
      amount: 15000,
      fee: 100,
      netAmount: 14900,
      status: "pending",
      bankDetails: {
        accountName: "Sarah Johnson",
        accountNumber: "9876543210",
        bankName: "Access Bank",
        bankCode: "044",
      },
      requestedAt: "2024-01-15T09:15:00Z",
      reference: "WTH-002-2024",
      reason: "Task earnings withdrawal",
    },
    {
      id: "payout-3",
      user: {
        id: "user-3",
        name: "Mike Chen",
        email: "mike.chen@email.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mike-chen",
      },
      amount: 30000,
      fee: 100,
      netAmount: 29900,
      status: "approved",
      bankDetails: {
        accountName: "Mike Chen",
        accountNumber: "5555666677",
        bankName: "GTBank",
        bankCode: "058",
      },
      requestedAt: "2024-01-14T16:20:00Z",
      processedAt: "2024-01-14T17:45:00Z",
      reference: "WTH-003-2024",
      reason: "Task earnings withdrawal",
    },
    {
      id: "payout-4",
      user: {
        id: "user-4",
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma-wilson",
      },
      amount: 8000,
      fee: 100,
      netAmount: 7900,
      status: "rejected",
      bankDetails: {
        accountName: "Emma Wilson",
        accountNumber: "1111222233",
        bankName: "UBA",
        bankCode: "033",
      },
      requestedAt: "2024-01-14T14:10:00Z",
      processedAt: "2024-01-14T15:30:00Z",
      reference: "WTH-004-2024",
      reason: "Insufficient account verification",
      rejectionReason: "Bank account details could not be verified",
    },
    {
      id: "payout-5",
      user: {
        id: "user-5",
        name: "David Brown",
        email: "david.brown@email.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=david-brown",
      },
      amount: 45000,
      fee: 100,
      netAmount: 44900,
      status: "pending",
      bankDetails: {
        accountName: "David Brown",
        accountNumber: "7777888899",
        bankName: "Zenith Bank",
        bankCode: "057",
      },
      requestedAt: "2024-01-15T08:45:00Z",
      reference: "WTH-005-2024",
      reason: "Task earnings withdrawal",
    },
  ];

  const filteredPayouts = payouts.filter((payout) => {
    const matchesSearch =
      payout.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payout.bankDetails.accountNumber.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || payout.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: payouts.length,
    pending: payouts.filter((p) => p.status === "pending").length,
    approved: payouts.filter((p) => p.status === "approved").length,
    rejected: payouts.filter((p) => p.status === "rejected").length,
    totalAmount: payouts
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
    totalFees: payouts
      .filter((p) => p.status === "approved")
      .reduce((sum, p) => sum + p.fee, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
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

  const handlePayoutAction = (payoutId: string, action: string) => {
    const payout = payouts.find((p) => p.id === payoutId);
    if (!payout) return;

    switch (action) {
      case "approve":
        toast({
          title: "Payout Approved",
          description: `${formatCurrency(payout.netAmount)} payout to ${payout.user.name} has been approved`,
        });
        break;
      case "reject":
        toast({
          title: "Payout Rejected",
          description: `Payout request from ${payout.user.name} has been rejected`,
          variant: "destructive",
        });
        break;
    }
  };

  const handleCopyAccountNumber = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber);
    toast({
      title: "Copied",
      description: "Account number copied to clipboard",
    });
  };

  const handleExportPayouts = () => {
    toast({
      title: "Export Started",
      description:
        "Payout data export has been initiated. You'll receive an email when ready.",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Payout Management
          </h1>
          <p className="text-gray-600 mt-2">
            Review and process withdrawal requests
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Requests
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.approved}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.rejected}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Pending Amount
                  </p>
                  <p className="text-xl font-bold text-purple-600">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>
                  Review and process user withdrawal requests
                </CardDescription>
              </div>
              <Button onClick={handleExportPayouts}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by user name, email, reference, or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Bank Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={payout.user.avatar || "/placeholder.svg"}
                              alt={payout.user.name}
                            />
                            <AvatarFallback>
                              {payout.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {payout.user.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payout.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {formatCurrency(payout.amount)}
                          </div>
                          <div className="text-muted-foreground">
                            Fee: {formatCurrency(payout.fee)}
                          </div>
                          <div className="text-green-600 font-medium">
                            Net: {formatCurrency(payout.netAmount)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {payout.bankDetails.accountName}
                          </div>
                          <div className="flex items-center space-x-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {payout.bankDetails.accountNumber}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleCopyAccountNumber(
                                  payout.bankDetails.accountNumber,
                                )
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-muted-foreground">
                            {payout.bankDetails.bankName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {payout.reference}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(payout.requestedAt)}</div>
                          {payout.processedAt && (
                            <div className="text-muted-foreground">
                              Processed: {formatDate(payout.processedAt)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {payout.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePayoutAction(payout.id, "approve")
                                  }
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve Payout
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handlePayoutAction(payout.id, "reject")
                                  }
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject Payout
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredPayouts.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No payout requests found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
