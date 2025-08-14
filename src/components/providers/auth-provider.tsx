"use client";

import type React from "react";
import { createContext, useContext, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  useSession,
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  sendVerificationEmail,
  resetPassword,
} from "@/lib/auth/auth-client";

import type { UserSession, Session } from "@/lib/auth/auth-client";
import { errorHandler } from "@/lib/error-handler";
import { toast } from "sonner";

type LoginMutation = {
  mutate: (variables: { email: string; password: string }) => void;
  isPending: boolean;
};

type SignupMutation = {
  mutate: (variables: {
    name: string;
    email: string;
    password: string;
  }) => void;
  isPending: boolean;
};

type LogoutMutation = {
  mutate: () => void;
  isPending: boolean;
};

type RequestPasswordResetMutation = {
  mutate: (variables: { email: string }) => void;
  isPending: boolean;
};

type ResetPasswordMutation = {
  mutate: (variables: { password: string; token: string }) => void;
  isPending: boolean;
};

type GoogleAuthMutation = {
  mutate: () => void;
  isPending: boolean;
};

type AuthContextType = {
  user: UserSession | null;
  session: Session | null;
  loading: boolean;
  loginMutation: LoginMutation;
  signupMutation: SignupMutation;
  logoutMutation: LogoutMutation;
  requestPasswordResetMutation: RequestPasswordResetMutation;
  resetPasswordMutation: ResetPasswordMutation;
  googleAuthMutation: GoogleAuthMutation;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending: loading } = useSession();
  const session = data as Session | null;
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user as UserSession;
  console.log("[AuthProvider] user:", user);

  // Redirect logic
  useEffect(() => {
    if (loading) {
      return;
    }
    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push("/login");
    }

    if (
      user &&
      user.advertiserRequestStatus !== "approved" &&
      !pathname.includes("/advertisers")
    ) {
      toast.error("You are not an advertiser");
      router.push("/home");
    }

    if (user && pathname === "/login") {
      router.push("/home");
    }
  }, [user, loading, pathname, router]);

  const loginMutation: LoginMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      return signIn.email(
        {
          email,
          password,
        },
        {
          onError: async (error) => {
            if (error.error.status === 403) {
              sendVerificationEmail({
                email,
                callbackURL: "/login?emailverified=true",
              })
                .then(() => {
                  toast.error("Email not verified", {
                    description: "A new verification email has been sent",
                  });
                })
                .catch((error) => {
                  errorHandler.handleQueryError(error.error.message);
                });
            } else {
              errorHandler.handleQueryError(error.error.message);
            }
          },
          onSuccess: () => {
            toast.success("Login successful");
          },
        },
      );
    },
  });

  const signupMutation: SignupMutation = useMutation({
    mutationFn: async ({
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    }) => {
      return signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/login?emailverified=true",
        },
        {
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Verification Email Sent");
          },
        },
      );
    },
  });

  const logoutMutation: LogoutMutation = useMutation({
    mutationFn: async () => {
      return signOut(
        {},
        {
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Logged out successfully");
          },
        },
      );
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const requestPasswordResetMutation: RequestPasswordResetMutation =
    useMutation({
      mutationFn: async ({ email }: { email: string }) => {
        return requestPasswordReset(
          {
            email,
            redirectTo: `${window.location.origin}/reset-password`,
          },
          {
            onError: (error) => {
              errorHandler.handleQueryError(error.error.message);
            },
            onSuccess: () => {
              toast.success("Reset password email sent");
            },
          },
        );
      },
    });

  const resetPasswordMutation: ResetPasswordMutation = useMutation({
    mutationFn: async ({
      password,
      token,
    }: {
      password: string;
      token: string;
    }) => {
      return resetPassword(
        {
          newPassword: password,
          token,
        },
        {
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
        },
      );
    },
    onSuccess: () => {
      toast.success("Password reset successful");
      router.push("/login");
    },
  });

  const googleAuthMutation: GoogleAuthMutation = useMutation({
    mutationFn: async () => {
      return signIn.social(
        {
          provider: "google",
          callbackURL: "/home",
        },
        {
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
        },
      );
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        loginMutation,
        signupMutation,
        logoutMutation,
        requestPasswordResetMutation,
        resetPasswordMutation,
        googleAuthMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
