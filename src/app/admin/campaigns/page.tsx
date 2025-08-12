"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Megaphone,
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Play,
  DollarSign,
  TrendingUp,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"

export default function AdminCampaigns() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  // Mock campaigns data
  const campaigns = [
    {
      id: "camp-1",
      title: "Instagram Follow Campaign",
      advertiser: "TechCorp Ltd",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=TechCorp",
      category: "Social Media",
      status: "active",
      budget: 50000,
      spent: 32000,
      participants: 245,
      maxParticipants: 500,
      reward: 200,
      completionRate: 89,
      createdAt: "2024-01-10T00:00:00Z",
      endsAt: "2024-01-25T23:59:59Z",
    },
    {
      id: "camp-2",
      title: "Facebook Page Like Campaign",
      advertiser: "Fashion Forward",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Fashion",
      category: "Social Media",
      status: "pending",
      budget: 30000,
      spent: 0,
      participants: 0,
      maxParticipants: 300,
      reward: 150,
      completionRate: 0,
      createdAt: "2024-01-14T00:00:00Z",
      endsAt: "2024-01-28T23:59:59Z",
    },
    {
      id: "camp-3",
      title: "App Review Campaign",
      advertiser: "EduTech Solutions",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=EduTech",
      category: "App Store",
      status: "active",
      budget: 75000,
      spent: 45000,
      participants: 180,
      maxParticipants: 250,
      reward: 300,
      completionRate: 94,
      createdAt: "2024-01-08T00:00:00Z",
      endsAt: "2024-01-22T23:59:59Z",
    },
    {
      id: "camp-4",
      title: "YouTube Subscribe Campaign",
      advertiser: "Digital Marketing Pro",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Digital",
      category: "Video",
      status: "paused",
      budget: 40000,
      spent: 15000,
      participants: 75,
      maxParticipants: 200,
      reward: 250,
      completionRate: 85,
      createdAt: "2024-01-12T00:00:00Z",
      endsAt: "2024-01-26T23:59:59Z",
    },
    {
      id: "camp-5",
      title: "Product Survey Campaign",
      advertiser: "TechCorp Ltd",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=TechCorp",
      category: "Survey",
      status: "completed",
      budget: 25000,
      spent: 25000,
      participants: 100,
      maxParticipants: 100,
      reward: 250,
      completionRate: 96,
      createdAt: "2024-01-05T00:00:00Z",
      endsAt: "2024-01-15T23:59:59Z",
    },
    {
      id: "camp-6",
      title: "TikTok Video Creation",
      advertiser: "Fashion Forward",
      advertiserAvatar: "https://api.dicebear.com/7.x/initials/svg?seed=Fashion",
      category: "Video",
      status: "rejected",
      budget: 60000,
      spent: 0,
      participants: 0,
      maxParticipants: 150,
      reward: 400,
      completionRate: 0,
      createdAt: "2024-01-13T00:00:00Z",
      endsAt: "2024-01-27T23:59:59Z",
    },
  ]

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.advertiser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    pending: campaigns.filter((c) => c.status === "pending").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    rejected: campaigns.filter((c) => c.status === "rejected").length,
    totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
    totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
      case "paused":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Paused</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleCampaignAction = (campaignId: string, action: string) => {
    const campaign = campaigns.find((c) => c.id === campaignId)
    if (!campaign) return

    switch (action) {
      case "approve":
        toast({
          title: "Campaign Approved",
          description: `${campaign.title} has been approved and is now active`,
        })
        break
      case "reject":
        toast({
          title: "Campaign Rejected",
          description: `${campaign.title} has been rejected`,
          variant: "destructive",
        })
        break
      case "pause":
        toast({
          title: "Campaign Paused",
          description: `${campaign.title} has been paused`,
        })
        break
      case "resume":
        toast({
          title: "Campaign Resumed",
          description: `${campaign.title} has been resumed`,
        })
        break
    }
  }

  const handleExportCampaigns = () => {
    toast({
      title: "Export Started",
      description: "Campaign data export has been initiated. You'll receive an email when ready.",
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="text-gray-600 mt-2">Monitor and manage all platform campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Campaigns</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Megaphone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-xl font-bold text-purple-600">{formatCurrency(stats.totalBudget)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Paused</p>
                  <p className="text-2xl font-bold text-gray-600">{stats.paused}</p>
                </div>
                <Pause className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>All Campaigns</CardTitle>
                <CardDescription>Monitor campaign performance and manage approvals</CardDescription>
              </div>
              <Button onClick={handleExportCampaigns}>
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
                  placeholder="Search campaigns by title, advertiser, or category..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Social Media">Social Media</SelectItem>
                  <SelectItem value="App Store">App Store</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Survey">Survey</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Participants</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={campaign.advertiserAvatar || "/placeholder.svg"}
                              alt={campaign.advertiser}
                            />
                            <AvatarFallback>{campaign.advertiser.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{campaign.title}</div>
                            <div className="text-sm text-muted-foreground">{campaign.advertiser}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{campaign.category}</Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{formatCurrency(campaign.budget)}</div>
                          <div className="text-muted-foreground">Spent: {formatCurrency(campaign.spent)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {campaign.participants}/{campaign.maxParticipants}
                          </div>
                          <div className="text-muted-foreground">
                            {Math.round((campaign.participants / campaign.maxParticipants) * 100)}% filled
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {campaign.completionRate > 0 ? (
                          <div className="text-sm">
                            <div className="font-medium text-green-600">{campaign.completionRate}%</div>
                            <div className="text-muted-foreground">completion</div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">No data</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/campaign/${campaign.id}`}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {campaign.status === "pending" && (
                              <>
                                <DropdownMenuItem
                                  onClick={() => handleCampaignAction(campaign.id, "approve")}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCampaignAction(campaign.id, "reject")}
                                  className="text-red-600"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {campaign.status === "active" && (
                              <DropdownMenuItem
                                onClick={() => handleCampaignAction(campaign.id, "pause")}
                                className="text-yellow-600"
                              >
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </DropdownMenuItem>
                            )}
                            {campaign.status === "paused" && (
                              <DropdownMenuItem
                                onClick={() => handleCampaignAction(campaign.id, "resume")}
                                className="text-green-600"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredCampaigns.length === 0 && (
              <div className="text-center py-8">
                <Megaphone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
