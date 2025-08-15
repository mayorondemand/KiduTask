"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ITEMS_TO_DISPLAY = 3;

export function BreadcrumbResponsive() {
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

  // Convert /home to /
  const normalizedPath = pathname === "/home" ? "/" : pathname;

  // Split into segments
  const segments =
    normalizedPath === "/"
      ? []
      : normalizedPath
          .split("/")
          .filter(Boolean)
          .map((seg, i, arr) => ({
            href: "/" + arr.slice(0, i + 1).join("/"),
            label: decodeURIComponent(seg)
              .replace(/-/g, " ")
              .replace(/^\w/, (c) => c.toUpperCase()),
          }));

  // Always start with Home
  const items = [{ href: "/home", label: "Home" }, ...segments];

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Back button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.back()}
        className="shrink-0"
      >
        Back
      </Button>

      <Breadcrumb>
        <BreadcrumbList>
          {/* First item */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={items[0].href}>{items[0].label}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {items.length > 1 && <BreadcrumbSeparator />}

          {/* Collapsed middle items */}
          {items.length > ITEMS_TO_DISPLAY ? (
            <>
              <BreadcrumbItem>
                {!isMobile ? (
                  <DropdownMenu open={open} onOpenChange={setOpen}>
                    <DropdownMenuTrigger
                      className="flex items-center gap-1"
                      aria-label="Toggle menu"
                    >
                      <BreadcrumbEllipsis className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {items.slice(1, -2).map((item) => (
                        <DropdownMenuItem key={item.href}>
                          <Link href={item.href}>{item.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Drawer open={open} onOpenChange={setOpen}>
                    <DrawerTrigger aria-label="Toggle Menu">
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader className="text-left">
                        <DrawerTitle>Navigate to</DrawerTitle>
                        <DrawerDescription>
                          Select a page to navigate to.
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="grid gap-1 px-4">
                        {items.slice(1, -2).map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="py-1 text-sm"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                      <DrawerFooter className="pt-4">
                        <DrawerClose asChild>
                          <Button variant="outline">Close</Button>
                        </DrawerClose>
                      </DrawerFooter>
                    </DrawerContent>
                  </Drawer>
                )}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}

          {/* Last visible items */}
          {items.slice(-ITEMS_TO_DISPLAY + 1).map((item, index, arr) => (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {index < arr.length - 1 ? (
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < arr.length - 1 && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
