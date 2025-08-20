import { toast } from "sonner";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AxiosError } from "axios";

// Base error class
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Specific error types that auto-map to status codes
export class NotAuthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "NotAuthorizedError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Resource not found") {
    super(message, "NOT_FOUND", 404);
    this.name = "NotFoundError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Bad request") {
    super(message, "BAD_REQUEST", 400);
    this.name = "BadRequestError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Resource conflict") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = "Database error") {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "Validation failed") {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access forbidden") {
    super(message, "FORBIDDEN", 403);
    this.name = "ForbiddenError";
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = "Too many requests") {
    super(message, "TOO_MANY_REQUESTS", 429);
    this.name = "TooManyRequestsError";
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = "Service temporarily unavailable") {
    super(message, "SERVICE_UNAVAILABLE", 503);
    this.name = "ServiceUnavailableError";
  }
}

export const errorHandler = {
  // // Client-side error handling (for frontend)
  // handle: (error: unknown, context?: string) => {
  //   console.error(`Error in ${context}:`, error);

  //   if (error instanceof AppError) {
  //     toast.error("Error", {
  //       description: error.message,
  //     });
  //     return error;
  //   }

  //   if (error instanceof Error) {
  //     toast.error("Something went wrong", {
  //       description: error.message,
  //     });
  //     return new AppError(error.message);
  //   }

  //   const genericError = new AppError("An unexpected error occurred");
  //   toast.error(genericError.message);
  //   return genericError;
  // },

  // Server-side API error handling (for routes)
  handleServerError: (error: unknown, context?: string): NextResponse => {
    console.error(`API Error in ${context}:`, error);

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: error.code,
          },
        },
        { status: error.statusCode || 500 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: {
            message: (error as ZodError).issues
              .map((issue) => {
                return `-> ${issue.path.join(">")}: ${issue.message}`;
              })
              .join(", "),
            code: "VALIDATION_ERROR",
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: {
            message: error.message,
            code: "INTERNAL_ERROR",
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: {
          message: "An unexpected error occurred",
          code: "UNKNOWN_ERROR",
        },
      },
      { status: 500 },
    );
  },

  handleQueryError(error: unknown) {
    let message = "An unexpected error occurred.";
    let description = "Please try again later.";
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else if (error instanceof AxiosError) {
      description = error.message;
      message = error.response?.data.error.message;
    }
    toast.error(message, {
      description,
    });
  },
};
