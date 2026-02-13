"use client";

import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@/features/auth/hooks";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

export function Navbar() {
  const { user } = useUser();
  const { signOut: { mutate: signOut } } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              href={user ? "/dashboard" : "/sign-in"}
              className="group">
              <div className="flex items-baseline gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Taskly
                </h1>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Manage
                </span>
              </div>
            </Link>
            {user &&
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/dashboard">
                  <Button
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    size="sm"
                    className="font-medium"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant={isActive("/profile") ? "default" : "ghost"}
                    size="sm"
                    className="font-medium"
                  >
                    Profile
                  </Button>
                </Link>
              </nav>}
          </div>

          <div className="flex items-center gap-3">
            {user ? <>
              <Link href="/profile" className="md:hidden">
                <Button variant="ghost" size="sm" className="font-medium">
                  Profile
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="font-medium">
                Sign Out
              </Button>
            </> : <>
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="font-medium">
                  Login
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="font-medium bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </>}
            <AnimatedThemeToggler />
          </div>
        </div>
      </div>
    </header>
  );
}
