import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./ui/skeleton";

interface StatsCardProps {
  className: string;
  icon: LucideIcon;
  title: string;
  value?: string | number;
  subtitle?: string;
  loading?: boolean;
}

export function StatsCard({
  className,
  icon: Icon,
  title,
  value,
  subtitle,
  loading = false,
}: StatsCardProps) {
  return (
    <Card className={cn("border-0 shadow-lg text-white", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm mb-1">{title}</p>
            {loading ? (
              <Skeleton className="opacity-90 my-3 h-10 w-20 bg-white/20" />
            ) : (
              <p className="text-3xl font-bold">{value ?? '—'}</p>
            )}
            {loading ? (
              <Skeleton className="opacity-90 h-4 w-20 bg-white/20" />
            ) : (
              <p className="text-white/80 text-xs mt-1">{subtitle ?? ''}</p>
            )}
          </div>
          <div className="p-3 rounded-full bg-white/20">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
