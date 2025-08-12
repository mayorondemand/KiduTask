import type React from "react"
import { Navbar } from "@/components/layout/navbar"

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

