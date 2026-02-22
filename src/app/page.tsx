import {
  ClipboardCheck,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  ChevronRight,
  Bell,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MEMBERS, calcStats } from "@/data/members";
import type { AttendanceRecord } from "@/data/members";

const today = new Date();
const dateString = today.toLocaleDateString("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "long",
});

// -----------------------------------------------
// ✏️ 오늘 출석 데이터를 여기서 관리하세요.
// MEMBERS 명단 기반으로 status를 업데이트하면 됩니다.
// status: "present"(출석) | "late"(지각) | "absent"(결석) | "unset"(미체크)
// -----------------------------------------------
const todayAttendance: AttendanceRecord[] = MEMBERS.map((m) => ({
  memberId: m.id,
  name: m.name,
  time: "-",
  status: "unset",
}));

const stats = calcStats(todayAttendance);

// 이번 달 진행 횟수 (직접 수정)
const MONTHLY_COUNT = 0;

// 오늘의 공지사항 (직접 수정, 없으면 빈 문자열 "")
const TODAY_NOTICE = "";

const statusConfig = {
  present: { label: "출석", bg: "bg-emerald-100", text: "text-emerald-600" },
  late:    { label: "지각", bg: "bg-amber-100",   text: "text-amber-600"  },
  absent:  { label: "결석", bg: "bg-red-100",     text: "text-red-500"   },
  unset:   { label: "미체크", bg: "bg-gray-100",  text: "text-gray-400"  },
};

export default function HomePage() {
  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">오늘의 출석현황</h1>
          <p className="text-sm text-gray-400 mt-0.5">{dateString}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 bg-white shadow-sm border border-gray-100"
        >
          <Bell className="h-4.5 w-4.5 text-gray-500" />
        </Button>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* 출석률 */}
        <Card className="col-span-2 border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/60">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-xs font-medium uppercase tracking-wide">
                오늘 출석률
              </p>
              <p className="text-6xl font-bold mt-1 tracking-tight">
                {stats.rate}
                <span className="text-3xl font-medium text-blue-200">%</span>
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

        {/* 빠른 출석체크 */}
        <Card className="col-span-2 border-0 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group active:scale-[0.98]">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-200">
                <ClipboardCheck className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-200" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">출석 체크하기</p>
                <p className="text-xs text-gray-400 mt-0.5">QR 또는 수동 입력</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 transition-colors duration-200" />
          </CardContent>
        </Card>

        {/* 지각 */}
        <Card className="border-0 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] text-amber-600 font-semibold uppercase tracking-wide">지각</span>
            </div>
            <p className="text-4xl font-bold text-amber-600">{stats.late}</p>
            <p className="text-xs text-amber-400 mt-1">명</p>
          </CardContent>
        </Card>

        {/* 월간 */}
        <Card className="border-0 bg-violet-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Calendar className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-[11px] text-violet-600 font-semibold uppercase tracking-wide">이번 달</span>
            </div>
            <p className="text-4xl font-bold text-violet-700">{MONTHLY_COUNT}</p>
            <p className="text-xs text-violet-400 mt-1">회 진행</p>
          </CardContent>
        </Card>

        {/* 공지 (내용 없으면 숨김) */}
        {TODAY_NOTICE && (
          <Card className="col-span-2 border-0 bg-gray-900 text-white shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-yellow-400/20 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-yellow-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-300">오늘의 공지</p>
                <p className="text-sm text-white mt-0.5">{TODAY_NOTICE}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 출석 목록 */}
        <Card className="col-span-2 md:col-span-4 border-0 bg-white shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                오늘 출석 명단
                <span className="text-xs font-normal text-gray-400">
                  ({todayAttendance.length}명)
                </span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-500 hover:text-blue-600 h-7 px-2 gap-0.5"
              >
                전체보기
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {todayAttendance.length === 0 ? (
              <div className="py-10 text-center text-gray-400 text-sm">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p>등록된 명단이 없습니다.</p>
                <p className="text-xs mt-1 text-gray-300">
                  src/data/members.ts 에서 이용자를 추가하세요.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {todayAttendance.map((item) => {
                  const cfg = statusConfig[item.status];
                  return (
                    <div
                      key={item.memberId}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {item.name[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {item.time}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2.5 py-1 rounded-full font-medium",
                            cfg.bg,
                            cfg.text
                          )}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
