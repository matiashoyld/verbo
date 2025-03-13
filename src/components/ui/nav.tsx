"use client";

import { SignOutButton, useUser } from "@clerk/nextjs";
import { LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function MainNav() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn, user } = useUser();

  // Generate avatar content
  const getAvatarContent = () => {
    // If no user or not signed in, return empty avatar placeholder
    if (!isSignedIn || !user) {
      return {
        imageUrl: "",
        fallback: "U",
        name: "User",
        email: "",
      };
    }

    // Get user details safely
    const imageUrl = user?.imageUrl ?? "";
    const name = user?.fullName ?? "User";

    let email = "";
    if (user?.emailAddresses && user.emailAddresses.length > 0) {
      email = user.emailAddresses[0]?.emailAddress ?? "";
    }

    // Get initial for fallback
    let fallback = "U";
    if (user?.firstName) {
      fallback = user.firstName.charAt(0);
    } else if (email) {
      fallback = email.charAt(0).toUpperCase();
    }

    return { imageUrl, fallback, name, email };
  };

  // Get user avatar data
  const { imageUrl, fallback, name, email } = getAvatarContent();

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Verbo.ai Logo"
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="hidden font-semibold text-verbo-dark sm:inline-block">
            verbo.ai
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          {isLoaded && isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer border border-border">
                  <AvatarImage src={imageUrl} alt={name} />
                  <AvatarFallback className="bg-verbo-dark/10 text-verbo-dark">
                    {fallback}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {name !== "User" && <p className="font-medium">{name}</p>}
                    {email && (
                      <p className="text-xs text-muted-foreground">{email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                  }}
                  className="cursor-pointer"
                >
                  <SignOutButton redirectUrl="/">
                    <div className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </div>
                  </SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-base text-verbo-dark"
                asChild
              >
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button
                size="sm"
                className="bg-verbo-dark text-base hover:bg-verbo-dark/90"
                asChild
              >
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
