"use client";

import { CampaignCard, CampaignSkeleton } from "@/components/campaign-card";
import { useAuth } from "@/components/providers/auth-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardData, type Campaign } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import Autoplay from "embla-carousel-autoplay";
import { AlertTriangle, Clock, Star, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function TrendingCampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaign/${campaign.id}`}>
      <Card className="shadow-none hover:border-primary/50 overflow-clip gap-2 transition-all duration-300 border-1 border-gray-200 p-0">
        <div className="relative">
          <div className="aspect-[4/3] relative overflow-hidden rounded-t-lg">
            <Image
              src={campaign.thumbnail}
              alt={campaign.title}
              className="w-full h-full object-cover"
              fill
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Rating */}
            <div className="absolute top-3 right-3 flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="h-3 w-3 text-yellow-500 mr-1" />
              <span className="text-xs font-medium">{campaign.rating}</span>
            </div>

            {/* Payout overlay */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-primary text-white px-3 py-1 rounded-full">
                <span className="text-sm tracking-loose font-semibold">
                  {formatCurrency(campaign.payout)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="mb-3">
            <h3 className="font-semibold text-base line-clamp-2 mb-1">
              {campaign.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {campaign.advertiser}
            </p>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{campaign.remainingSlots} left</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{campaign.estimatedTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function TrendingCampaignSkeleton() {
  return (
    <Card className="basis-[28%] border-0 shadow-none flex-shrink-0">
      <Skeleton className="aspect-[7/3] w-full rounded-t-lg" />
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
  );
}

export default function TaskerDashboard() {
  const { user } = useAuth();
  const [showKycAlert, setShowKycAlert] = useState(false);
  const { data, isLoading } = useDashboardData();

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* KYC Warning Alert */}
        {!user?.isKycVerified && showKycAlert && (
          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <div className="flex items-center justify-between w-full">
              <AlertDescription className="text-orange-800">
                <strong>Complete your KYC verification</strong> to withdraw
                funds and access all features.{" "}
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to earn some money? Check out the latest campaigns below.
          </p>
        </div>

        {/* Trending Campaigns Carousel */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              Trending Campaigns
            </h2>
            <div className="flex items-center space-x-2">
              <Link href="/campaigns">
                <Button variant="outline" size="sm" className="bg-white">
                  View All
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex transition-transform duration-300 ease-in-out gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <Array has no data to create a key>
                  <TrendingCampaignSkeleton key={i} />
                ))
              ) : (
                <Carousel
                  className="flex transition-transform duration-300 ease-in-out gap-6"
                  plugins={[
                    Autoplay({
                      delay: 2000,
                    }),
                  ]}
                  opts={{
                    loop: true,
                    align: "start",
                    slidesToScroll: 1,
                    dragFree: true,
                  }}
                >
                  <CarouselContent className="p-4 -ml-5">
                    {data?.trendingCampaigns.map((campaign) => (
                      <CarouselItem
                        key={campaign.id}
                        className="basis-[28%] pl-5"
                      >
                        <TrendingCampaignCard campaign={campaign} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              )}
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
              ? Array.from({ length: 2 }).map((_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: <Array has no data to create a key>
                  <CampaignSkeleton key={i} />
                ))
              : data?.activeCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
