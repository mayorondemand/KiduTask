import type { activityEnum, statusEnum } from "@/lib/db/schema";
import { BadRequestError } from "@/lib/error-handler";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { z } from "zod";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number | unknown) => {
  if (typeof amount !== "number") {
    return undefined;
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (
  status: (typeof statusEnum.enumValues)[number] | (typeof activityEnum.enumValues)[number],
) => {
  switch (status) {
    case "active":
      return "capitalize bg-blue-100 text-blue-800 border-blue-200";
    case "paused":
      return "capitalize bg-gray-100 text-gray-800 border-gray-200";
    case "pending":
      return "capitalize bg-yellow-100 text-yellow-800 border-yellow-200";
    case "approved":
      return "capitalize bg-green-100 text-green-800 border-green-200";
    case "rejected":
      return "capitalize bg-red-100 text-red-800 border-red-200";
    default:
      return "capitalize bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const validateQueryParams = (
  searchParams: URLSearchParams,
  schema: z.ZodSchema,
) => {
  const rawParams = Object.fromEntries(searchParams.entries());
  const queryParams: Record<string, string | number | Date> = { ...rawParams };

  // Convert numeric string fields to numbers
  const numericFields = [
    "page",
    "limit",
    "minPayout",
    "maxPayout",
    "minMaxUsers",
    "maxMaxUsers",
    "estimatedTimeMinutes",
  ];
  for (const field of numericFields) {
    if (queryParams[field] && !Number.isNaN(Number(queryParams[field]))) {
      queryParams[field] = Number(queryParams[field]);
    }
  }

  // Convert date string fields to Date objects
  const dateFields = [
    "createdAfter",
    "createdBefore",
    "expiryAfter",
    "expiryBefore",
  ];
  for (const field of dateFields) {
    if (queryParams[field]) {
      const date = new Date(queryParams[field]);
      if (!Number.isNaN(date.getTime())) {
        queryParams[field] = date;
      }
    }
  }

  const validatedParams = schema.safeParse(queryParams);
  if (!validatedParams.success) {
    throw new BadRequestError(validatedParams.error.message);
  }
  return validatedParams.data;
};
