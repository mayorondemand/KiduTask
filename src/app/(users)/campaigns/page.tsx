"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Eye, Users, Clock, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Campaign {
  id: string;
  title: string;
  description: string;
  payout: number;
  remainingSlots: number;
  totalSlots: number;
  category: string;
  thumbnail: string;
  advertiser: string;
  difficulty: "easy" | "medium" | "hard";
  estimatedTime: string;
  rating: number;
  isCompleted?: boolean;
}

const fetchCampaigns = async (filters: any) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const allCampaigns: Campaign[] = [
    {
      id: "1",
      title: "Follow @TechStartup on Instagram",
      description:
        "Follow our Instagram account and like the latest post. Help us grow our social media presence.",
      payout: 150,
      remainingSlots: 45,
      totalSlots: 100,
      category: "Social Media",
      thumbnail: "/instagram-follow-campaign.png",
      advertiser: "TechStartup Inc",
      difficulty: "easy",
      estimatedTime: "2 mins",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Write App Review on Play Store",
      description:
        "Download our productivity app and write a genuine 5-star review based on your experience.",
      payout: 500,
      remainingSlots: 12,
      totalSlots: 50,
      category: "App Review",
      thumbnail: "/app-review-playstore.png",
      advertiser: "MobileApp Co",
      difficulty: "medium",
      estimatedTime: "10 mins",
      rating: 4.6,
    },
    {
      id: "3",
      title: "Share Facebook Post",
      description:
        "Share our promotional post on your Facebook timeline and tag 2 friends who might be interested.",
      payout: 200,
      remainingSlots: 78,
      totalSlots: 200,
      category: "Social Media",
      thumbnail: "/facebook-share-post.png",
      advertiser: "Brand Marketing",
      difficulty: "easy",
      estimatedTime: "1 min",
      rating: 4.9,
    },
    {
      id: "4",
      title: "YouTube Video Like & Subscribe",
      description:
        "Like our latest video tutorial and subscribe to our educational channel.",
      payout: 300,
      remainingSlots: 25,
      totalSlots: 75,
      category: "Video",
      thumbnail: "/youtube-subscribe-like.png",
      advertiser: "Content Creator",
      difficulty: "easy",
      estimatedTime: "3 mins",
      rating: 4.7,
    },
    {
      id: "5",
      title: "Twitter Retweet Campaign",
      description:
        "Retweet our product announcement and add your own comment about why you're excited.",
      payout: 250,
      remainingSlots: 60,
      totalSlots: 150,
      category: "Social Media",
      thumbnail: "/twitter-retweet-campaign.png",
      advertiser: "Social Brand",
      difficulty: "medium",
      estimatedTime: "5 mins",
      rating: 4.5,
    },
    {
      id: "6",
      title: "TikTok Video Creation",
      description:
        "Create a 30-second TikTok video showcasing our product in a creative way.",
      payout: 800,
      remainingSlots: 8,
      totalSlots: 20,
      category: "UGC",
      thumbnail: "/tiktok-video-creation.png",
      advertiser: "Creative Agency",
      difficulty: "hard",
      estimatedTime: "30 mins",
      rating: 4.4,
    },
  ];

  return {
    campaigns: allCampaigns,
    totalCount: allCampaigns.length,
  };
};

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden rounded-t-lg">
        <img
          src={campaign.thumbnail || "/placeholder.svg"}
          alt={campaign.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge className={getDifficultyColor(campaign.difficulty)}>
            {campaign.difficulty}
          </Badge>
        </div>
        <div className="absolute top-2 left-2">
          <div className="flex items-center bg-white/90 rounded-full px-2 py-1 text-xs">
            <Star className="h-3 w-3 text-yellow-500 mr-1" />
            <span>{campaign.rating}</span>
          </div>
        </div>
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2">
              {campaign.title}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              by {campaign.advertiser}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(campaign.payout)}
            </div>
            <div className="text-xs text-muted-foreground">per task</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {campaign.description}
        </p>

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
  );
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
  );
}

export default function CampaignsPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [payoutFilter, setPayoutFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["campaigns", { searchQuery, categoryFilter, payoutFilter }],
    queryFn: () =>
      fetchCampaigns({ searchQuery, categoryFilter, payoutFilter }),
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            All Campaigns
          </h1>
          <p className="text-gray-600">
            Discover and complete tasks to earn money
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="app-review">App Review</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="ugc">UGC</SelectItem>
                </SelectContent>
              </Select>

              <Select value={payoutFilter} onValueChange={setPayoutFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Payout Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payouts</SelectItem>
                  <SelectItem value="low">₦100 - ₦300</SelectItem>
                  <SelectItem value="medium">₦300 - ₦600</SelectItem>
                  <SelectItem value="high">₦600+</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="bg-transparent">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {isLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              `Showing ${data?.campaigns.length || 0} campaigns`
            )}
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CampaignSkeleton key={i} />
              ))
            : data?.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
        </div>

        {/* Empty State */}
        {!isLoading && data?.campaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
