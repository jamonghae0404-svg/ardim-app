"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, BarChart3, Settings, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/attendance", label: "출석체크", icon: ClipboardCheck },
  { href: "/stats", label: "통계", icon: BarChart3 },
  { href: "/admin", label: "관리자", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden">
      <div className="flex h-16 items-center justify-around px-2 pb-safe">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all duration-200",
                active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-all",
                  active && "stroke-[2.5]"
                )}
              />
              <span className="text-[11px] font-medium">{label}</span>
              {active && (
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-gray-100 bg-white px-4 py-6 gap-1 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">스마트 출석부</p>
          <p className="text-[11px] text-gray-400">복지관 관리 시스템</p>
        </div>
      </div>

      {/* Nav items */}
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 font-medium text-sm",
              active
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            )}
          >
            <Icon
              className={cn(
                "h-4.5 w-4.5",
                active ? "stroke-[2.5] text-blue-600" : "text-gray-400"
              )}
            />
            {label}
            {active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
            )}
          </Link>
        );
      })}

      {/* Bottom info */}
      <div className="mt-auto px-3">
        <div className="rounded-xl bg-blue-50 p-4">
          <p className="text-xs font-semibold text-blue-700">아르딤 복지관</p>
          <p className="text-[11px] text-blue-400 mt-0.5">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
}
