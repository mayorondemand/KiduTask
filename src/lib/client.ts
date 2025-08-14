import { useMutation, useQuery } from "@tanstack/react-query";
import { errorHandler } from "@/lib/error-handler";
import axios from "axios";
import { toast } from "sonner";

export interface Campaign {
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
}

// Mock data fetching function
const fetchDashboardData = async (): Promise<{
  trendingCampaigns: Campaign[];
  activeCampaigns: Campaign[];
}> => {
  // Simulate 5-second delay
  await new Promise((resolve) => setTimeout(resolve, 5000));

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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/instagram-follow-campaign.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/app-review-playstore.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/facebook-share-post.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/youtube-subscribe-like.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/twitter-retweet-campaign.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/tiktok-video-creation.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/linkedin-engagement.png",
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
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/product-survey.png",
        advertiser: "Market Research Co",
        difficulty: "medium" as const,
        estimatedTime: "8 mins",
        rating: 4.3,
      },
      {
        id: "9",
        title: "Product Survey Completion",
        description: "Complete a 5-minute survey about our new product",
        payout: 400,
        remainingSlots: 20,
        totalSlots: 100,
        category: "Survey",
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/product-survey.png",
        advertiser: "Market Research Co",
        difficulty: "medium" as const,
        estimatedTime: "8 mins",
        rating: 4.3,
      },
      {
        id: "10",
        title: "Product Survey Completion",
        description: "Complete a 5-minute survey about our new product",
        payout: 400,
        remainingSlots: 20,
        totalSlots: 100,
        category: "Survey",
        thumbnail:
          "https://ik.imagekit.io/bluconvalley/kuditask/campaigns/product-survey.png",
        advertiser: "Market Research Co",
        difficulty: "medium" as const,
        estimatedTime: "8 mins",
        rating: 4.3,
      },
    ],
  };
};

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });
};

export const useAdvertiserRequest = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.post("/api/advertiser/request");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Your request has been sent to the admin for approval");
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useAdvertiserStats = () => {
  return useQuery({
    queryKey: ["advertiser-stats"],
    queryFn: async () => {
      const response = await axios.get("/api/advertiser/stats");
      return response.data;
    },
  });
};
