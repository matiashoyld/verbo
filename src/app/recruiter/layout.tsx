"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "~/lib/utils";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  items: { href: string; title: string }[];
}

export default function RecruiterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Check if this is a submission detail page
  const isSubmissionDetailPage =
    pathname.includes("/recruiter/submissions/") &&
    !pathname.endsWith("/submissions");

  // Use a different layout for submission detail pages
  if (isSubmissionDetailPage) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="w-full flex-1">
          <main className="flex w-full flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // Regular layout with sidebar for other pages
  return (
    <div className="flex min-h-screen flex-col">
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
          <div className="py-6 pr-6 lg:py-8">
            <SidebarNav
              items={[
                { title: "Overview", href: "/recruiter" },
                { title: "Candidates", href: "/recruiter/candidates" },
                { title: "Skills", href: "/recruiter/skills" },
                { title: "Positions", href: "/recruiter/positions" },
                { title: "Submissions", href: "/recruiter/submissions" },
                { title: "Settings", href: "/recruiter/settings" },
              ]}
            />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}

function SidebarNav({ className, items, ...props }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "transparent",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
}
