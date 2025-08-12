"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { useQuery } from "@tanstack/react-query"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, Users, Clock, Star, ChevronLeft, ChevronRight, AlertTriangle, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

interface Campaign {
  id: string
  title: string
  description: string
  payout: number
  remainingSlots: number
  totalSlots: number
  category: string
  thumbnail: string
  advertiser: string
  difficulty: "easy" | "medium" | "hard"
  estimatedTime: string
  rating: number
}

// Mock data fetching function
const fetchDashboardData = async () => {
  // Simulate 5-second delay
  await new Promise((resolve) => setTimeout(resolve, 5000))

  return {
    trendingCampaigns: [
      {
        id: "1",
        title: "Follow @TechStartup on Instagram",
        description: "Follow our Instagram account and like the latest post",
        payout: 150,
        remainingSlots: 45,
        totalSlots: 100,
        category: "Social Media",
        thumbnail: "/instagram-follow-campaign.png",
        advertiser: "TechStartup Inc",
        difficulty: "easy" as const,
        estimatedTime: "2 mins",
        rating: 4.8,
      },
      {
        id: "2",
        title: "Write App Review on Play Store",
        description: "Download our app and write a genuine 5-star review",
        payout: 500,
        remainingSlots: 12,
        totalSlots: 50,
        category: "App Review",
        thumbnail: "/app-review-playstore.png",
        advertiser: "MobileApp Co",
        difficulty: "medium" as const,
        estimatedTime: "10 mins",
        rating: 4.6,
      },
      {
        id: "3",
        title: "Share Facebook Post",
        description: "Share our promotional post on your Facebook timeline",
        payout: 200,
        remainingSlots: 78,
        totalSlots: 200,
        category: "Social Media",
        thumbnail: "/facebook-share-post.png",
        advertiser: "Brand Marketing",
        difficulty: "easy" as const,
        estimatedTime: "1 min",
        rating: 4.9,
      },
      {
        id: "4",
        title: "YouTube Video Like & Subscribe",
        description: "Like our latest video and subscribe to our channel",
        payout: 300,
        remainingSlots: 25,
        totalSlots: 75,
        category: "Video",
        thumbnail: "/youtube-subscribe-like.png",
        advertiser: "Content Creator",
        difficulty: "easy" as const,
        estimatedTime: "3 mins",
        rating: 4.7,
      },
      {
        id: "5",
        title: "Twitter Retweet Campaign",
        description: "Retweet our announcement and tag 3 friends",
        payout: 250,
        remainingSlots: 60,
        totalSlots: 150,
        category: "Social Media",
        thumbnail: "/twitter-retweet-campaign.png",
        advertiser: "Social Brand",
        difficulty: "medium" as const,
        estimatedTime: "5 mins",
        rating: 4.5,
      },
      {
        id: "6",
        title: "TikTok Video Creation",
        description: "Create a 30-second TikTok video showcasing our product",
        payout: 800,
        remainingSlots: 8,
        totalSlots: 20,
        category: "UGC",
        thumbnail: "/tiktok-video-creation.png",
        advertiser: "Creative Agency",
        difficulty: "hard" as const,
        estimatedTime: "30 mins",
        rating: 4.4,
      },
    ],
    activeCampaigns: [
      {
        id: "7",
        title: "LinkedIn Post Engagement",
        description: "Like and comment on our LinkedIn company post",
        payout: 180,
        remainingSlots: 35,
        totalSlots: 80,
        category: "Social Media",
        thumbnail: "/linkedin-engagement.png",
        advertiser: "B2B Solutions",
        difficulty: "easy" as const,
        estimatedTime: "3 mins",
        rating: 4.6,
      },
      {
        id: "8",
        title: "Product Survey Completion",
        description: "Complete a 5-minute survey about our new product",
        payout: 400,
        remainingSlots: 20,
        totalSlots: 100,
        category: "Survey",
        thumbnail: "/product-survey.png",
        advertiser: "Market Research Co",
        difficulty: "medium" as const,
        estimatedTime: "8 mins",
        rating: 4.3,
      },
    ],
  }
}

function TrendingCampaignCard({ campaign }: { campaign: Campaign }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-500"
      case "medium":
        return "bg-yellow-500"
      case "hard":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="w-80 flex-shrink-0 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
      <div className="relative">
        <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
          <img
            src={campaign.thumbnail || "/placeholder.svg"}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* Difficulty indicator */}
          <div className="absolute top-3 left-3">
            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(campaign.difficulty)}`} />
          </div>

          {/* Rating */}
          <div className="absolute top-3 right-3 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="text-xs font-medium">{campaign.rating}</span>
          </div>

          {/* Payout overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-green-600 text-white px-3 py-1 rounded-full">
              <span className="text-sm font-bold">{formatCurrency(campaign.payout)}</span>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-base line-clamp-2 mb-1">{campaign.title}</h3>
          <p className="text-xs text-muted-foreground">{campaign.advertiser}</p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{campaign.remainingSlots} left</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{campaign.estimatedTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs px-2 py-1">
            {campaign.category}
          </Badge>
          <Link href={`/campaign/${campaign.id}`}>
            <Button size="sm" className="h-7 px-3 text-xs">
              Start Task
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={campaign.thumbnail || "/placeholder.svg"}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getDifficultyColor(campaign.difficulty)}>{campaign.difficulty}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">by {campaign.advertiser}</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">{formatCurrency(campaign.payout)}</div>
            <div className="text-xs text-muted-foreground">per task</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{campaign.remainingSlots} slots left</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{campaign.estimatedTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="secondary">{campaign.category}</Badge>
          <Link href={`/campaign/${campaign.id}`}>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendingCampaignSkeleton() {
  return (
    <Card className="w-80 flex-shrink-0">
      <Skeleton className="aspect-[4/3] w-full rounded-t-lg" />
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-7 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

function CampaignSkeleton() {
  return (
    <Card>
      <Skeleton className="aspect-video w-full rounded-t-lg" />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function TaskerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showKycAlert, setShowKycAlert] = useState(true)

  useEffect(() => {
    if (user && user.role !== "tasker") {
      if (user.role === "admin") {
        router.push("/admin")
      } else if (user.role === "advertiser") {
        router.push("/advertisers")
      }
    }
  }, [user, router])

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  })

  const nextSlide = () => {
    if (data?.trendingCampaigns) {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, data.trendingCampaigns.length - 2))
    }
  }

  const prevSlide = () => {
    if (data?.trendingCampaigns) {
      setCurrentSlide(
        (prev) =>
          (prev - 1 + Math.max(1, data.trendingCampaigns.length - 2)) % Math.max(1, data.trendingCampaigns.length - 2),
      )
    }
  }

  if (!user || user.role !== "tasker") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* KYC Warning Alert */}
        {user.kycStatus !== "verified" && showKycAlert && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div className="flex items-center justify-between w-full">
              <AlertDescription className="text-orange-800">
                <strong>Complete your KYC verification</strong> to withdraw funds and access all features.{" "}
                <Link href="/profile" className="underline font-medium">
                  Complete KYC now
                </Link>
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowKycAlert(false)}
                className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 h-auto p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user.name}! 👋</h1>
          <p className="text-gray-600">Ready to earn some money? Check out the latest campaigns below.</p>
        </div>

        {/* Trending Campaigns Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">🔥 Trending Campaigns</h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={prevSlide} disabled={isLoading} className="bg-white">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextSlide} disabled={isLoading} className="bg-white">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Link href="/campaigns">
                <Button variant="outline" size="sm" className="bg-white">
                  View All
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-6"
              style={{ transform: `translateX(-${currentSlide * (320 + 24)}px)` }}
            >
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <TrendingCampaignSkeleton key={i} />)
                : data?.trendingCampaigns.map((campaign) => (
                    <TrendingCampaignCard key={campaign.id} campaign={campaign} />
                  ))}
            </div>
          </div>
        </section>

        {/* Active Campaigns */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">More Campaigns</h2>
            <Link href="/campaigns">
              <Button variant="outline" className="bg-white">
                View All
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 2 }).map((_, i) => <CampaignSkeleton key={i} />)
              : data?.activeCampaigns.map((campaign) => <CampaignCard key={campaign.id} campaign={campaign} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
