"use client";
import { useAuth } from "@/components/providers/auth-provider";
import { errorHandler } from "@/lib/error-handler";
import type { AdvertiserStats } from "@/lib/services/advertiser-service";
import type {
  BrandSettingsFormData,
  CampaignFilters,
  CampaignWithCounts,
  CreateCampaignData,
  SubmissionFormData,
  ReviewSubmissionData,
  SubmissionWithUser,
  UpdateCampaignActivityData as UpdateCampaignData,
  CampaignSubmissionAndCount,
  TransactionTypeEnum,
  TransactionDB,
} from "@/lib/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useAdvertiserAccess = () => {
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

export const useAdvertiserDashboard = () => {
  return useQuery({
    queryKey: ["advertiser-dashboard"],
    queryFn: async (): Promise<AdvertiserStats> => {
      const response = await axios.get("/api/advertiser/stats");
      return response.data.stats;
    },
  });
};

export interface PlatformSettings {
  platformFee: number;
  minimumWithdrawal: number;
  maximumWithdrawal: number;
  minimumDeposit: number;
  withdrawalFee: number;
}

export const usePlatformSettings = () => {
  return useQuery({
    queryKey: ["platform-settings"],
    queryFn: async (): Promise<PlatformSettings> => {
      const response = await axios.get("/api/platform-settings");
      return response.data;
    },
  });
};

export const useCreateCampaign = () => {
  const router = useRouter();
  const { refetch } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCampaignData) => {
      const response = await axios.post("/api/advertiser/campaigns", data);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Campaign created successfully");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      router.push(`/advertisers/campaigns/${data.campaignId}`);
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useAdvertiserCampaigns = (filters: CampaignFilters) => {
  return useQuery({
    queryKey: ["advertiser-campaigns", filters],
    queryFn: async (): Promise<CampaignWithCounts[]> => {
      const response = await axios.get("/api/advertiser/campaigns", {
        params: filters,
      });
      return response.data.campaigns;
    },
  });
};

export const useAdvertiserCampaign = (id: string) => {
  return useQuery({
    queryKey: ["campaign", id],
    queryFn: async (): Promise<CampaignWithCounts> => {
      const response = await axios.get(`/api/advertiser/campaigns/${id}`);
      return response.data.campaign;
    },
    enabled: !!id,
  });
};

export const useCampaignSubmissions = (
  campaignId: string,
  page: number = 1,
  limit: number = 10,
) => {
  return useQuery({
    queryKey: ["campaign-submissions", campaignId, page, limit],
    queryFn: async (): Promise<CampaignSubmissionAndCount> => {
      const response = await axios.get(
        `/api/advertiser/campaigns/${campaignId}/submissions`,
        {
          params: { page, limit },
        },
      );
      return response.data;
    },
    enabled: !!campaignId,
  });
};

export const useReviewSubmission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      submissionId,
      status,
      advertiserFeedback,
      advertiserRating,
    }: ReviewSubmissionData) => {
      const response = await axios.patch(
        `/api/advertiser/submissions/${submissionId}`,
        {
          status,
          advertiserFeedback,
          advertiserRating,
        },
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(data.message);
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateCampaignData) => {
      const { campaignId, ...body } = data;
      const response = await axios.patch(
        `/api/advertiser/campaigns/${campaignId}`,
        body,
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["campaign", variables.campaignId],
      });
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success(data.message);
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useUpdateBrandSettings = () => {
  const { refetch } = useAuth();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: BrandSettingsFormData) => {
      const response = await axios.patch("/api/advertiser/brand", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Brand settings updated successfully");
      refetch();
      router.back();
    },
    onError: errorHandler.handleQueryError,
  });
};

// Public campaign queries for regular users
export const usePublicCampaigns = (filters: CampaignFilters) => {
  return useQuery({
    queryKey: ["campaigns", filters],
    queryFn: async (): Promise<CampaignWithCounts[]> => {
      const response = await axios.get("/api/campaigns", {
        params: filters,
      });
      return response.data.campaigns;
    },
  });
};

export const usePublicCampaign = (id: string) => {
  return useQuery({
    queryKey: ["public-campaign", id],
    queryFn: async (): Promise<CampaignWithCounts> => {
      const response = await axios.get(`/api/campaigns/${id}`);
      return response.data.campaign;
    },
    enabled: !!id,
  });
};

export const useMySubmissions = (campaignId: string) => {
  return useQuery({
    queryKey: ["user-submissions", campaignId],
    queryFn: async (): Promise<SubmissionWithUser[]> => {
      const response = await axios.get(
        `/api/campaigns/${campaignId}/submissions`,
      );
      return response.data.submissions;
    },
    enabled: !!campaignId,
  });
};

export const useSubmitTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      data,
    }: {
      campaignId: string;
      data: SubmissionFormData;
    }) => {
      const response = await axios.post(
        `/api/campaigns/${campaignId}/submissions`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-submissions", variables.campaignId],
      });
      toast.success("Task submitted successfully");
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useRateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      campaignId,
      rating,
    }: {
      campaignId: string;
      rating: number;
    }) => {
      const response = await axios.post(`/api/campaigns/${campaignId}/rating`, {
        rating,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["user-campaign-rating", variables.campaignId],
      });
      toast.success(
        "Campaign rating submitted successfully. You cannot change this rating.",
      );
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useMyCampaignRating = (campaignId: string) => {
  return useQuery({
    queryKey: ["user-campaign-rating", campaignId],
    queryFn: async () => {
      const response = await axios.get(`/api/campaigns/${campaignId}/rating`);
      return response.data.rating;
    },
    enabled: !!campaignId,
  });
};

export const useUploadAuth = () => {
  return useQuery({
    queryKey: ["upload-auth"],
    queryFn: async () => {
      const response = await axios.get("/api/upload-auth");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInitiateDeposit = () => {
  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await axios.post("/api/wallet/deposit", { amount });
      return response.data as {
        link: string;
      };
    },
    onError: errorHandler.handleQueryError,
  });
};

export const useCreateWithdrawal = () => {
  return useMutation({
    mutationFn: async (amount: number) => {
      const response = await axios.post("/api/wallet/withdraw", { amount });
      return response.data;
    },
    onError: errorHandler.handleQueryError,
  });
};

export type TransactionClient = {
  id: number;
  type: TransactionTypeEnum;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  fee?: number | null;
};

export const useTransactions = (limit: number = 50) => {
  return useQuery({
    queryKey: ["wallet-transactions", limit],
    queryFn: async (): Promise<TransactionDB[]> => {
      const response = await axios.get("/api/wallet/transactions", {
        params: { limit },
      });
      return response.data.transactions;
    },
  });
};
