"use client";

import {
  requestPasswordReset,
  resetPassword,
  signIn,
  signOut,
  useSession,
} from "@/lib/auth/auth-admin";
import { useMutation } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { createContext, useContext, useEffect } from "react";

import type { Session, UserSession } from "@/lib/auth/auth-admin";
import { errorHandler } from "@/lib/error-handler";
import { toast } from "sonner";

type LoginMutation = {
  mutate: (variables: { email: string; password: string }) => void;
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

type AdminAuthContext = {
  user: UserSession | null;
  session: Session | null;
  loading: boolean;
  loginMutation: LoginMutation;
  logoutMutation: LogoutMutation;
  requestPasswordResetMutation: RequestPasswordResetMutation;
  resetPasswordMutation: ResetPasswordMutation;
  refetch: () => void;
};

const AuthContext = createContext<AdminAuthContext | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending: loading, refetch } = useSession();
  const session = data as Session | null;
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user as UserSession;
  console.log("[AdminProvider] user:", user);

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
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Login successful");
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
      router.push("/");
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
      router.push("/");
    },
  });

  // Redirect logic
  useEffect(() => {
    if (loading) {
      return;
    }

    // if (user.role === undefined) {
    //   console.warn(
    //     `[AdminProvider] ${pathname} -> Home <Not Public, Not Admin>`,
    //   );
    //   logoutMutation.mutate();
    // }

    const publicPaths = ["/", "/forgot-password", "/reset-password"];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      console.warn(
        `[AdminProvider] ${pathname} -> Home <Not Public, Not User>`,
      );
      router.push("/");
    }

    if (user && pathname === "/") {
      console.warn(`[AdminProvider] ${pathname} -> Home <User, Login>`);
      router.push("/dashboard");
    }
  }, [user, loading, pathname, router, logoutMutation]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        loginMutation,
        logoutMutation,
        requestPasswordResetMutation,
        resetPasswordMutation,
        refetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AdminProvider");
  }
  return context;
}
