"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardCheck, Users, TrendingUp,
  CheckCircle2, XCircle, HelpCircle,
  BarChart3, Settings, ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calcStats, getTodayKey, type Member, type Program, type AttendanceData } from "@/lib/storage";
import { fetchPrograms, fetchMembers, fetchAttendance } from "@/lib/db";
import { useOperator } from "@/components/operator-provider";

const TODAY_KEY  = getTodayKey();
const DATE_LABEL = new Date().toLocaleDateString("ko-KR", {
  year: "numeric", month: "long", day: "numeric", weekday: "long",
});

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );
}

export default function HomePage() {
  const { operatorName } = useOperator();

  const [programs,       setPrograms]       = useState<Program[]>([]);
  const [members,        setMembers]        = useState<Member[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [isLoading,      setIsLoading]      = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      fetchPrograms(operatorName),
      fetchMembers(operatorName),
      fetchAttendance(operatorName),
    ]).then(([p, m, a]) => {
      if (cancelled) return;
      setPrograms(p);
      setMembers(m);
      setAttendanceData(a);
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [operatorName]);

  const dayRecord = attendanceData[TODAY_KEY] ?? {};
  const stats     = calcStats(members, dayRecord);

  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 max-w-5xl mx-auto w-full">

      {/* 헤더 */}
      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">오늘의 출석현황</h1>
        <p className="text-sm text-gray-400 mt-0.5">{DATE_LABEL}</p>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* 출석률 */}
          <Card className="col-span-2 border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/60">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">오늘 출석률</p>
                <p className="text-6xl font-bold mt-1 tracking-tight">
                  {stats.rate}<span className="text-3xl font-medium text-blue-200">%</span>
                </p>
                <p className="text-blue-200 text-xs mt-3">
                  전체 {stats.total}명 중{" "}
                  <span className="text-white font-semibold">{stats.present}명</span> 출석
                </p>
              </div>
              <div className="h-16 w-16 rounded-2xl bg-white/15 flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
            </CardContent>
          </Card>

          {/* 출석 */}
          <Card className="border-0 bg-emerald-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[11px] text-emerald-600 font-semibold uppercase tracking-wide">출석</span>
              </div>
              <p className="text-4xl font-bold text-emerald-700">{stats.present}</p>
              <p className="text-xs text-emerald-400 mt-1">명</p>
            </CardContent>
          </Card>

          {/* 결석 */}
          <Card className="border-0 bg-red-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <XCircle className="h-3.5 w-3.5 text-red-400" />
                <span className="text-[11px] text-red-500 font-semibold uppercase tracking-wide">결석</span>
              </div>
              <p className="text-4xl font-bold text-red-600">{stats.absent}</p>
              <p className="text-xs text-red-400 mt-1">명</p>
            </CardContent>
          </Card>

          {/* 미체크 */}
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">미체크</span>
              </div>
              <p className="text-4xl font-bold text-gray-600">{stats.unset}</p>
              <p className="text-xs text-gray-400 mt-1">명</p>
            </CardContent>
          </Card>

          {/* 이용자 수 */}
          <Card className="border-0 bg-gray-50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Users className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wide">전체</span>
              </div>
              <p className="text-4xl font-bold text-gray-600">{members.length}</p>
              <p className="text-xs text-gray-400 mt-1">명 등록</p>
            </CardContent>
          </Card>

          {/* 빠른 메뉴 */}
          <Card className="col-span-2 border-0 bg-white shadow-sm">
            <CardContent className="p-4 space-y-2">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-3">빠른 메뉴</p>
              {[
                { href: "/attendance", icon: ClipboardCheck, label: "출석 체크하기", desc: `${programs.length}개 프로그램`, color: "bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white" },
                { href: "/stats",      icon: BarChart3,      label: "통계 보기",     desc: "실인원 · 연인원",          color: "bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white" },
                { href: "/admin",      icon: Settings,       label: "명단 관리",     desc: `${members.length}명 등록됨`, color: "bg-gray-100 text-gray-600 group-hover:bg-gray-700 group-hover:text-white" },
              ].map(({ href, icon: Icon, label, desc, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors duration-200 ${color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* 오늘 출석 명단 */}
          <Card className="col-span-2 md:col-span-4 border-0 bg-white shadow-sm">
            <CardHeader className="pb-2 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                오늘 출석 명단
                <span className="text-xs font-normal text-gray-400">({members.length}명)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              {members.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                  <p>등록된 이용자가 없습니다.</p>
                  <p className="text-xs mt-1 text-gray-300">관리자 페이지에서 등록하세요.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {members.map((m) => {
                    const status = dayRecord[m.id] ?? "unset";
                    const cfg =
                      status === "present" ? { label: "출석", bg: "bg-emerald-100", text: "text-emerald-600" } :
                      status === "absent"  ? { label: "결석", bg: "bg-red-100",     text: "text-red-500"   } :
                                            { label: "미체크", bg: "bg-gray-100",   text: "text-gray-400"  };
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {m.name[0]}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">{m.name}</span>
                            <p className="text-[10px] text-gray-400">{m.programName}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                          {cfg.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
