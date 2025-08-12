"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "tasker"
  walletBalance: number
  isAdvertiser: boolean
  isKycVerified: boolean
  isAdvertiserRequestPending: boolean
  completedTasks: number
  rating: number
  joinedAt: string
}

interface AuthContextType {
  user: User
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({
    id: "user-1",
    name: "John Doe",
    email: "john@email.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
    role: "tasker",
    walletBalance: 15750,
    isAdvertiser: false,
    isKycVerified: true,
    completedTasks: 47,
    rating: 4.8,
    joinedAt: "2023-06-15T00:00:00Z",
    isAdvertiserRequestPending: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()


  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock user data based on email
      let mockUser: User

      if (email === "admin@kuditask.com") {
        mockUser = {
          id: "admin-1",
          name: "Admin User",
          email: "admin@kuditask.com",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
          role: "admin",
          walletBalance: 0,
          isAdvertiser: false,
          isKycVerified: true,
          completedTasks: 0,
          rating: 5.0,
          joinedAt: "2023-01-01T00:00:00Z",
          isAdvertiserRequestPending: false,
        }
      } else {
        mockUser = {
          id: "user-1",
          name: "John Doe",
          email: email,
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
          role: "tasker",
          walletBalance: 15750,
          isAdvertiser: false,
          isKycVerified: true,
          completedTasks: 47,
          rating: 4.8,
          joinedAt: "2023-06-15T00:00:00Z",
          isAdvertiserRequestPending: false,
        }
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))

      // Redirect based on role
      if (mockUser.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/home")
      }
    } catch (error) {
      throw new Error("Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        role: "tasker",
        walletBalance: 0,
        isAdvertiser: false,
        isKycVerified: false,
        completedTasks: 0,
        rating: 0,
        joinedAt: new Date().toISOString(),
        isAdvertiserRequestPending: false,
      }

      setUser(mockUser)
      localStorage.setItem("user", JSON.stringify(mockUser))
      router.push("/home")
    } catch (error) {
      throw new Error("Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem("user", JSON.stringify(updatedUser))
    }
  }

  return (
    <AuthContext.Provider value={{ user: user as User, login, register, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
