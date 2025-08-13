import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "@/lib/client";
import { formatCurrency } from "@/lib/utils";
import { Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link href={`/campaign/${campaign.id}`}>
      <Card className="overflow-clip shadow-none border-1 border-gray-200 p-0 hover:border-primary/50 transition-shadow">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={campaign.thumbnail}
            alt={campaign.title}
            className="w-full h-full object-cover"
            fill
          />
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
              <div className="text-lg font-bold text-primary">
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
        </CardContent>
      </Card>
    </Link>
  );
}

export function CampaignSkeleton() {
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
