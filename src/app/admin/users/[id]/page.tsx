"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  Wallet,
  Activity,
  Ban,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function UserDetailPage({ params }) {
  const { user } = useAuth()
  const router = useRouter()
  
  const [selectedUser, setSelectedUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [walletDialog, setWalletDialog] = useState(false)
  const [walletAction, setWalletAction] = useState("credit")
  const [walletAmount, setWalletAmount] = useState("")
  const [walletReason, setWalletReason] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    // Simulate fetching user data
    const fetchUser = async () => {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data
      setSelectedUser({
        id: params.id,
        name: "John Doe",
        email: "john.doe@example.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
        userType: "both",
        status: "active",
        kycStatus: "verified",
        walletBalance: 25000,
        totalEarnings: 150000,
        totalSpent: 75000,
        completedTasks: 45,
        createdCampaigns: 8,
        joinedAt: "2023-06-15T10:30:00Z",
        lastActive: "2024-01-15T14:20:00Z",
        phone: "+234 801 234 5678",
        location: "Lagos, Nigeria",
        bankAccount: {
          accountName: "John Doe",
          accountNumber: "0123456789",
          bankName: "First Bank of Nigeria",
          isVerified: true,
        },
        kycDocuments: [
          {
            type: "NIN",
            status: "verified",
            uploadedAt: "2023-06-16T09:00:00Z",
          },
          {
            type: "Utility Bill",
            status: "verified",
            uploadedAt: "2023-06-16T09:15:00Z",
          },
        ],
        recentTransactions: [
          {
            id: "txn-1",
            type: "earning",
            amount: 500,
            description: "Task completion reward",
            date: "2024-01-15T10:30:00Z",
            status: "completed",
          },
          {
            id: "txn-2",
            type: "withdrawal",
            amount: 10000,
            description: "Bank withdrawal",
            date: "2024-01-14T16:20:00Z",
            status: "completed",
          },
          {
            id: "txn-3",
            type: "campaign_spend",
            amount: 5000,
            description: "Instagram Follow Campaign",
            date: "2024-01-13T11:45:00Z",
            status: "completed",
          },
        ],
        recentActivities: [
          {
            id: "act-1",
            type: "task_completed",
            description: "Completed Instagram Follow task",
            date: "2024-01-15T10:30:00Z",
          },
          {
            id: "act-2",
            type: "campaign_created",
            description: "Created new App Review campaign",
            date: "2024-01-14T14:20:00Z",
          },
          {
            id: "act-3",
            type: "withdrawal_requested",
            description: "Requested withdrawal of ₦10,000",
            date: "2024-01-14T16:20:00Z",
          },
        ],
      })
      setIsLoading(false)
    }

    fetchUser()
  }, [params.id])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "suspended":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Suspended</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Pending</Badge>
      case "banned":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Banned</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getKYCBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getUserTypeBadge = (type) => {
    switch (type) {
      case "tasker":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Tasker</Badge>
      case "advertiser":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Advertiser</Badge>
      case "both":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Both</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const handleUserAction = async (action) => {
    setActionLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const actionMessages = {
      suspend: "User has been suspended",
      activate: "User has been activated",
      ban: "User has been banned",
      verify_kyc: "User KYC has been verified",
    }

    toast({
      title: "Action Completed",
      description: actionMessages[action] || "Action completed successfully",
    })

    setActionLoading(false)
  }

  const handleWalletAction = async () => {
    if (!walletAmount || !walletReason) {
      toast({
        title: "Missing Information",
        description: "Please enter amount and reason",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Wallet Updated",
      description: `User wallet has been ${walletAction === "credit" ? "credited" : "debited"} with ${formatCurrency(Number.parseFloat(walletAmount))}`,
    })

    setWalletAmount("")
    setWalletReason("")
    setWalletDialog(false)
    setActionLoading(false)
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">User Details</h1>
          </div>
        </div>

        {/* User Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={selectedUser?.avatar || "/placeholder.svg"} alt={selectedUser?.name} />
                  <AvatarFallback className="text-xl">{selectedUser?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedUser?.name}</h2>
                  <p className="text-gray-600 mb-2">{selectedUser?.email}</p>
                  <div className="flex space-x-2">
                    {getStatusBadge(selectedUser?.status)}
                    {getUserTypeBadge(selectedUser?.userType)}
                    {getKYCBadge(selectedUser?.kycStatus)}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Dialog open={walletDialog} onOpenChange={setWalletDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Wallet className="h-4 w-4 mr-2" />
                      Manage Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Manage User Wallet</DialogTitle>
                      <DialogDescription>Credit or debit the user's wallet balance</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Action</Label>
                        <div className="flex space-x-2 mt-2">
                          <Button
                            variant={walletAction === "credit" ? "default" : "outline"}
                            onClick={() => setWalletAction("credit")}
                            className="flex-1"
                          >
                            Credit
                          </Button>
                          <Button
                            variant={walletAction === "debit" ? "default" : "outline"}
                            onClick={() => setWalletAction("debit")}
                            className="flex-1"
                          >
                            Debit
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount (₦)</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={walletAmount}
                          onChange={(e) => setWalletAmount(e.target.value)}
                          placeholder="Enter amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                          id="reason"
                          value={walletReason}
                          onChange={(e) => setWalletReason(e.target.value)}
                          placeholder="Enter reason for this transaction"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setWalletDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleWalletAction} disabled={actionLoading}>
                        {actionLoading ? "Processing..." : `${walletAction === "credit" ? "Credit" : "Debit"} Wallet`}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {selectedUser?.status === "active" ? (
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction("suspend")}
                    disabled={actionLoading}
                    className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => handleUserAction("activate")}
                    disabled={actionLoading}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activate
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => handleUserAction("ban")}
                  disabled={actionLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban User
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Wallet className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Wallet Balance</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedUser?.walletBalance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedUser?.totalEarnings)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <DollarSign className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(selectedUser?.totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedUser?.completedTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="kyc">KYC & Banking</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>User's personal and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-gray-900">{selectedUser?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email Address</p>
                        <p className="text-gray-900">{selectedUser?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Phone Number</p>
                        <p className="text-gray-900">{selectedUser?.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Location</p>
                        <p className="text-gray-900">{selectedUser?.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Joined Date</p>
                        <p className="text-gray-900">{formatDate(selectedUser?.joinedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-600">Last Active</p>
                        <p className="text-gray-900">{formatDate(selectedUser?.lastActive)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>User's recent wallet transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedUser?.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="capitalize">{transaction.type.replace("_", " ")}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>
                          <span
                            className={
                              transaction.type === "earning" || transaction.type === "deposit"
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {transaction.type === "earning" || transaction.type === "deposit" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>User's recent platform activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedUser?.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{activity.description}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(activity.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="kyc">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>KYC Verification</CardTitle>
                  <CardDescription>User's identity verification status and documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">KYC Status</h4>
                        <p className="text-sm text-muted-foreground">Identity verification status</p>
                      </div>
                      {getKYCBadge(selectedUser?.kycStatus)}
                    </div>
                    <div>
                      <h4 className="font-medium mb-3">Uploaded Documents</h4>
                      <div className="space-y-2">
                        {selectedUser?.kycDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium">{doc.type}</p>
                                <p className="text-sm text-muted-foreground">Uploaded {formatDate(doc.uploadedAt)}</p>
                              </div>
                            </div>
                            <Badge
                              className={
                                doc.status === "verified"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              }
                            >
                              {doc.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Banking Information</CardTitle>
                  <CardDescription>User's bank account details for withdrawals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Bank Account</h4>
                        <p className="text-sm text-muted-foreground">Withdrawal account details</p>
                      </div>
                      {selectedUser?.bankAccount?.isVerified ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Account Name</p>
                          <p className="text-gray-900">{selectedUser?.bankAccount?.accountName}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Account Number</p>
                          <p className="text-gray-900">{selectedUser?.bankAccount?.accountNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Bank Name</p>
                          <p className="text-gray-900">{selectedUser?.bankAccount?.bankName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
