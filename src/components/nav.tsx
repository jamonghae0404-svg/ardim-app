"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardCheck, BarChart3, Settings, Building2, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOperator } from "@/components/operator-provider";

const navItems = [
  { href: "/attendance", label: "출석체크", icon: ClipboardCheck },
  { href: "/stats",      label: "통계",     icon: BarChart3      },
  { href: "/admin",      label: "관리자",   icon: Settings       },
];

export function BottomNav() {
  const pathname = usePathname();
  const { operatorName, clearOperator } = useOperator();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white/95 backdrop-blur-md md:hidden">
      {/* 담당자 정보 바 */}
      <div className="flex items-center justify-between px-4 py-1.5 border-b border-gray-50/80">
        <p className="text-[10px] text-gray-400">
          <span className="font-semibold text-gray-600">{operatorName || "담당자"}</span> 담당자
        </p>
        <button
          onClick={clearOperator}
          className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-red-400 active:scale-95 transition-all"
        >
          <LogOut className="h-3 w-3" />
          전환
        </button>
      </div>

      {/* 탭 */}
      <div className="flex h-14 items-center justify-around px-2 pb-safe">
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
              <Icon className={cn("h-5 w-5 transition-all", active && "stroke-[2.5]")} />
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
  const { operatorName, clearOperator } = useOperator();

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-gray-100 bg-white px-4 py-6 gap-1 shrink-0">
      {/* 로고 */}
      <div className="flex items-center gap-3 px-3 mb-8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-sm shadow-blue-200">
          <Building2 className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">스마트 출석부</p>
          <p className="text-[11px] text-gray-400">복지관 관리 시스템</p>
        </div>
      </div>

      {/* 내비게이션 항목 */}
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

      {/* 하단 — 담당자 정보 + 로그아웃 */}
      <div className="mt-auto px-3 space-y-2">
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="text-[10px] font-medium text-blue-400 uppercase tracking-wide">현재 담당자</p>
          <p className="text-sm font-bold text-blue-700 mt-0.5 truncate">{operatorName || "담당자"}</p>
          <p className="text-[10px] text-blue-300 mt-0.5">아르딤 복지관</p>
        </div>
        <button
          onClick={clearOperator}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-gray-200 text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 active:scale-[0.98] transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          담당자 전환
        </button>
      </div>
    </aside>
  );
}
