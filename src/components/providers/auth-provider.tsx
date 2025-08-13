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
  forgetPassword,
} from "@/lib/auth/auth-client";

import type { User, Session } from "@/lib/auth/auth-config";
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

type ResetPasswordMutation = {
  mutate: (variables: { email: string }) => void;
  isPending: boolean;
};

type GoogleAuthMutation = {
  mutate: () => void;
  isPending: boolean;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  loginMutation: LoginMutation;
  signupMutation: SignupMutation;
  logoutMutation: LogoutMutation;
  resetPasswordMutation: ResetPasswordMutation;
  googleAuthMutation: GoogleAuthMutation;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending: loading } = useSession();
  const session = data as Session | null;
  const router = useRouter();
  const pathname = usePathname();

  const user = session?.user || null;

  // Redirect logic
  useEffect(() => {
    if (loading) {
      return;
    }
    const publicPaths = [
      "/",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
    ];
    const isPublicPath = publicPaths.includes(pathname);

    if (!user && !isPublicPath) {
      router.push("/login");
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
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Login successful");
          },
        }
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
        },
        {
          onError(error) {
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Account created successfully");
          },
        }
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
        }
      );
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const resetPasswordMutation: ResetPasswordMutation = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      return forgetPassword(
        {
          email,
          redirectTo: `${window.location.origin}/reset-password`,
        },
        {
          onError: (error) => {
            errorHandler.handleQueryError(error.error.message);
          },
          onSuccess: () => {
            toast.success("Password reset successful");
          },
        }
      );
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
          onSuccess: () => {
            toast.success("Logged in successfully");
          },
        }
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
