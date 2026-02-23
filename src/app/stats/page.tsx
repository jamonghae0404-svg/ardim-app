"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Users, BarChart3, TrendingUp,
  BookOpen, Activity, Layers, Download, SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  getStorageKeys,
  type Program, type Member, type AttendanceData,
} from "@/lib/storage";
import { useOperator } from "@/components/operator-provider";

// ═══════════════════════════════════════════════════
// 날짜 유틸
// ═══════════════════════════════════════════════════

function getMonthDates(year: number, month: number): string[] {
  const days = new Date(year, month, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(year, month - 1, i + 1);
    return d.toISOString().split("T")[0];
  });
}

function getSelectedWeekDates(year: number, month: number, week: string): string[] {
  const all = getMonthDates(year, month);
  const slices: Record<string, [number, number]> = {
    "1": [0,  7],
    "2": [7,  14],
    "3": [14, 21],
    "4": [21, all.length],
  };
  if (week === "all") return all;
  const [s, e] = slices[week] ?? [0, all.length];
  return all.slice(s, e);
}

function fullDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${y}.${m}.${d}`;
}

function shortDate(iso: string) {
  const [, m, d] = iso.split("-");
  return `${parseInt(m)}/${parseInt(d)}`;
}

function dateRange(dates: string[]): string {
  if (dates.length === 0) return "-";
  return `${fullDate(dates[0])} ~ ${fullDate(dates[dates.length - 1])}`;
}

// ═══════════════════════════════════════════════════
// 통계 계산
// ═══════════════════════════════════════════════════

interface PeriodStats {
  실인원: number;
  연인원: number;
  진행횟수: number;
  등록인원: number;
}

function calcPeriodStats(
  dates: string[],
  members: Member[],
  attendance: AttendanceData,
): PeriodStats {
  const memberIds = new Set(members.map((m) => m.id));
  const unique    = new Set<string>();
  let   연인원    = 0;
  let   진행횟수  = 0;

  for (const date of dates) {
    const present = Object.entries(attendance[date] ?? {})
      .filter(([id, s]) => s === "present" && memberIds.has(id))
      .map(([id]) => id);
    if (present.length > 0) {
      진행횟수++;
      연인원 += present.length;
      present.forEach((id) => unique.add(id));
    }
  }
  return { 실인원: unique.size, 연인원, 진행횟수, 등록인원: members.length };
}

function calcRate({ 등록인원, 진행횟수, 연인원 }: PeriodStats) {
  if (등록인원 === 0 || 진행횟수 === 0) return 0;
  return Math.round((연인원 / (등록인원 * 진행횟수)) * 100);
}

// ═══════════════════════════════════════════════════
// CSV 다운로드
// ═══════════════════════════════════════════════════

function downloadCSV(
  year: number, month: number,
  dates: string[],
  members: Member[],
  attendance: AttendanceData,
  programLabel: string,
) {
  const BOM      = "\uFEFF";
  const dayHdrs  = dates.map((d) => `${parseInt(d.split("-")[2])}일`);
  const headers  = ["번호", "이름", "전화번호", "프로그램", ...dayHdrs, "출석일수", "결석일수"];

  const rows = members.map((m, i) => {
    const cells = dates.map((date) => {
      const s = attendance[date]?.[m.id] ?? "unset";
      return s === "present" ? "O" : s === "absent" ? "X" : "";
    });
    return [i + 1, m.name, m.phone || "-", m.programName,
            ...cells,
            cells.filter((c) => c === "O").length,
            cells.filter((c) => c === "X").length];
  });

  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [
    [`${year}년 ${month}월 출석현황`].map(esc).join(","),
    [`조회 프로그램: ${programLabel}`].map(esc).join(","),
    "",
    headers.map(esc).join(","),
    ...rows.map((r) => r.map(esc).join(",")),
  ].join("\n");

  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), {
    href: url, download: `출석현황_${year}년_${month}월.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════
// 상수
// ═══════════════════════════════════════════════════

const NOW           = new Date();
const CURRENT_YEAR  = NOW.getFullYear();
const CURRENT_MONTH = NOW.getMonth() + 1;
const TODAY_KEY     = NOW.toISOString().split("T")[0];

const YEAR_OPTIONS  = Array.from({ length: 4 }, (_, i) => CURRENT_YEAR - 3 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const WEEK_OPTIONS  = [
  { value: "all", label: "전체 (전 기간)" },
  { value: "1",   label: "1주차 (1일 ~ 7일)" },
  { value: "2",   label: "2주차 (8일 ~ 14일)" },
  { value: "3",   label: "3주차 (15일 ~ 21일)" },
  { value: "4",   label: "4주차 (22일 ~ 말일)" },
];

// ═══════════════════════════════════════════════════
// 컴포넌트
// ═══════════════════════════════════════════════════

export default function StatsPage() {
  const { operatorName } = useOperator();

  const [programs,       setPrograms]       = useState<Program[]>([]);
  const [members,        setMembers]        = useState<Member[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  const [filterProgram, setFilterProgram]   = useState("all");
  const [selectedYear,  setSelectedYear]    = useState(CURRENT_YEAR);
  const [selectedMonth, setSelectedMonth]   = useState(CURRENT_MONTH);
  const [selectedWeek,  setSelectedWeek]    = useState("all");

  // ── 로드 ─────────────────────────────────────────
  useEffect(() => {
    const KEYS = getStorageKeys(operatorName);
    try {
      const p = localStorage.getItem(KEYS.PROGRAMS);
      const m = localStorage.getItem(KEYS.MEMBERS);
      const a = localStorage.getItem(KEYS.ATTENDANCE);
      if (p) setPrograms(JSON.parse(p));
      if (m) setMembers(JSON.parse(m));
      if (a) setAttendanceData(JSON.parse(a));
    } catch { /* 무시 */ }
  }, [operatorName]);

  useEffect(() => { setSelectedWeek("all"); }, [selectedYear, selectedMonth]);

  // ── 날짜 범위 계산 ───────────────────────────────
  const monthDates = useMemo(
    () => getMonthDates(selectedYear, selectedMonth),
    [selectedYear, selectedMonth],
  );
  const weekDates = useMemo(
    () => getSelectedWeekDates(selectedYear, selectedMonth, selectedWeek),
    [selectedYear, selectedMonth, selectedWeek],
  );

  const targetMembers = useMemo(
    () => filterProgram === "all"
      ? members
      : members.filter((m) => m.programId === filterProgram),
    [filterProgram, members],
  );

  const weekStats  = useMemo(
    () => calcPeriodStats(weekDates,  targetMembers, attendanceData),
    [weekDates, targetMembers, attendanceData],
  );
  const monthStats = useMemo(
    () => calcPeriodStats(monthDates, targetMembers, attendanceData),
    [monthDates, targetMembers, attendanceData],
  );

  const barData = useMemo(() => {
    const idSet = new Set(targetMembers.map((m) => m.id));
    return weekDates.map((date) => ({
      date,
      count: Object.entries(attendanceData[date] ?? {})
        .filter(([id, s]) => s === "present" && idSet.has(id))
        .length,
    }));
  }, [weekDates, targetMembers, attendanceData]);
  const maxBar = Math.max(...barData.map((d) => d.count), 1);

  const programBreakdown = useMemo(() =>
    programs.map((p) => ({
      program: p,
      ...calcPeriodStats(monthDates, members.filter((m) => m.programId === p.id), attendanceData),
    })),
    [programs, members, monthDates, attendanceData],
  );

  const monthLabel   = `${selectedYear}년 ${selectedMonth}월`;
  const weekOpt      = WEEK_OPTIONS.find((w) => w.value === selectedWeek);
  const weekShort    = selectedWeek === "all" ? "전체" : `${selectedWeek}주차`;
  const weekRange    = dateRange(weekDates);
  const programLabel = filterProgram === "all"
    ? "전체 프로그램"
    : programs.find((p) => p.id === filterProgram)?.name ?? "전체";
  const isCurrentMonth = selectedYear === CURRENT_YEAR && selectedMonth === CURRENT_MONTH;
  const manyBars = weekDates.length > 14;

  // ── 렌더 ─────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 max-w-5xl mx-auto w-full">

      <div className="pt-2">
        <h1 className="text-xl font-bold text-gray-900">통계</h1>
        <p className="text-sm text-gray-400 mt-0.5">실인원 · 연인원 현황</p>
      </div>

      {/* ══ 필터 카드 ══ */}
      <Card className="border-0 bg-white shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-xs font-semibold text-gray-500">조회 필터</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={filterProgram} onValueChange={setFilterProgram}>
              <SelectTrigger className="h-9 w-36 rounded-xl border-gray-200 text-xs">
                <SelectValue placeholder="전체 프로그램" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 프로그램</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-5 w-px bg-gray-200 shrink-0" />

            <Select
              value={String(selectedYear)}
              onValueChange={(v) => setSelectedYear(Number(v))}
            >
              <SelectTrigger className="h-9 w-24 rounded-xl border-gray-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            >
              <SelectTrigger className="h-9 w-20 rounded-xl border-gray-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((m) => (
                  <SelectItem key={m} value={String(m)}>{m}월</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
              <SelectTrigger className="h-9 w-40 rounded-xl border-gray-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEK_OPTIONS.map((w) => (
                  <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={() =>
                downloadCSV(selectedYear, selectedMonth, monthDates,
                  targetMembers, attendanceData, programLabel)
              }
              disabled={targetMembers.length === 0}
              className="h-9 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 ml-auto"
            >
              <Download className="h-3.5 w-3.5" />
              엑셀 다운로드
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="text-gray-400">현재 조회</span>
            <span className="text-gray-300">·</span>
            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
              {programLabel}
            </span>
            <span className="text-gray-300">·</span>
            <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full font-medium">
              {monthLabel}
              {isCurrentMonth && (
                <span className="ml-1 text-blue-500">이번 달</span>
              )}
            </span>
            <span className="text-gray-300">·</span>
            <span className="bg-gray-50 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {weekShort}
            </span>
            <span className="text-gray-300 text-[10px] hidden sm:inline">
              {weekRange}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ══ Bento Grid ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        <Card className="col-span-2 border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[11px] font-semibold text-blue-200 uppercase tracking-wide">
                    주차 통계
                  </p>
                  <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                    {weekOpt?.label.split(" ")[0] ?? "전체"}
                  </span>
                </div>
                <p className="text-[10px] text-blue-300 mt-0.5 truncate">{weekRange}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-200 text-[11px] font-medium">실인원</p>
                <p className="text-4xl font-bold mt-0.5">{weekStats.실인원}</p>
                <p className="text-blue-300 text-[10px] mt-1">중복 제거 인원</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-blue-200 text-[11px] font-medium">연인원</p>
                <p className="text-4xl font-bold mt-0.5">{weekStats.연인원}</p>
                <p className="text-blue-300 text-[10px] mt-1">누적 출석 인원</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-2 border-0 bg-gradient-to-br from-violet-600 to-violet-700 text-white shadow-lg shadow-violet-200/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-violet-200 uppercase tracking-wide">
                  월간 통계
                </p>
                <p className="text-[10px] text-violet-300 mt-0.5">{monthLabel} 전체</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-violet-200 text-[11px] font-medium">실인원</p>
                <p className="text-4xl font-bold mt-0.5">{monthStats.실인원}</p>
                <p className="text-violet-300 text-[10px] mt-1">중복 제거 인원</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-violet-200 text-[11px] font-medium">연인원</p>
                <p className="text-4xl font-bold mt-0.5">{monthStats.연인원}</p>
                <p className="text-violet-300 text-[10px] mt-1">누적 출석 인원</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-blue-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-[11px] text-blue-600 font-semibold">{weekShort} 진행</span>
            </div>
            <p className="text-4xl font-bold text-blue-700">{weekStats.진행횟수}</p>
            <p className="text-xs text-blue-400 mt-1">회</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-violet-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Activity className="h-3.5 w-3.5 text-violet-500" />
              <span className="text-[11px] text-violet-600 font-semibold">{selectedMonth}월 진행</span>
            </div>
            <p className="text-4xl font-bold text-violet-700">{monthStats.진행횟수}</p>
            <p className="text-xs text-violet-400 mt-1">회</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-emerald-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[11px] text-emerald-600 font-semibold">등록 인원</span>
            </div>
            <p className="text-4xl font-bold text-emerald-700">{targetMembers.length}</p>
            <p className="text-xs text-emerald-400 mt-1">명</p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-amber-50 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-1.5 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-[11px] text-amber-600 font-semibold">{selectedMonth}월 출석률</span>
            </div>
            <p className="text-4xl font-bold text-amber-700">{calcRate(monthStats)}</p>
            <p className="text-xs text-amber-400 mt-1">%</p>
          </CardContent>
        </Card>

        {/* 일별 막대 차트 */}
        <Card className="col-span-2 md:col-span-4 border-0 bg-white shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-500" />
              {weekShort} 일별 연인원 현황
              <span className="text-[10px] font-normal text-gray-400 ml-1">{weekRange}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {barData.every((d) => d.count === 0) ? (
              <div className="py-6 text-center text-xs text-gray-300">
                해당 기간에 출석 기록이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div
                  className="flex items-end gap-1"
                  style={{ minWidth: manyBars ? `${weekDates.length * 28}px` : undefined }}
                >
                  {barData.map(({ date, count }) => {
                    const pct     = (count / maxBar) * 100;
                    const isToday = date === TODAY_KEY;
                    return (
                      <div key={date} className="flex-1 flex flex-col items-center gap-0.5" style={{ minWidth: 20 }}>
                        {!manyBars && (
                          <span className="text-[10px] text-gray-500 font-medium h-4">
                            {count > 0 ? count : ""}
                          </span>
                        )}
                        <div className="w-full flex items-end justify-center" style={{ height: 64 }}>
                          <div
                            className={`w-full rounded-t-md transition-all duration-500 ${
                              count === 0 ? "bg-gray-100"
                              : isToday   ? "bg-blue-500"
                              :             "bg-blue-300"
                            }`}
                            style={{ height: count === 0 ? 3 : `${Math.max(pct, 6)}%` }}
                          />
                        </div>
                        <span className={`text-[9px] font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                          {shortDate(date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 프로그램별 현황 */}
        <Card className="col-span-2 md:col-span-4 border-0 bg-white shadow-sm">
          <CardHeader className="pb-2 px-5 pt-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-500" />
                프로그램별 현황
                <span className="text-xs font-normal text-gray-400">({monthLabel} 전체)</span>
              </CardTitle>
              <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                전 프로그램 표시
              </span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {programBreakdown.length === 0 ? (
              <div className="py-10 text-center text-sm border border-dashed border-gray-200 rounded-xl">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                <p className="text-gray-400">등록된 프로그램이 없습니다.</p>
                <p className="text-xs mt-1 text-gray-300">관리자 페이지에서 프로그램을 추가하세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {programBreakdown.map(({ program, 실인원, 연인원, 진행횟수, 등록인원 }) => {
                  const rate       = 등록인원 > 0 && 진행횟수 > 0
                    ? Math.round((연인원 / (등록인원 * 진행횟수)) * 100) : 0;
                  const isSelected = filterProgram === program.id;
                  return (
                    <div
                      key={program.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        isSelected
                          ? "border-violet-300 bg-violet-50/40"
                          : "border-gray-100 hover:border-blue-100 hover:bg-blue-50/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-violet-200" : "bg-violet-100"
                          }`}>
                            <BookOpen className="h-3.5 w-3.5 text-violet-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{program.name}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full font-medium">
                              필터 중
                            </span>
                          )}
                        </div>
                        <span className={`text-sm font-bold ${
                          rate >= 80 ? "text-emerald-600"
                          : rate >= 50 ? "text-amber-500" : "text-red-400"
                        }`}>{rate}%</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { label: "실인원", val: 실인원,          bg: "bg-blue-50",    color: "text-blue-700",    sub: "text-blue-500"    },
                          { label: "연인원", val: 연인원,          bg: "bg-violet-50",  color: "text-violet-700",  sub: "text-violet-500"  },
                          { label: "진행",   val: `${진행횟수}회`, bg: "bg-gray-50",    color: "text-gray-700",    sub: "text-gray-500"    },
                          { label: "등록",   val: `${등록인원}명`, bg: "bg-emerald-50", color: "text-emerald-700", sub: "text-emerald-500" },
                        ].map(({ label, val, bg, color, sub }) => (
                          <div key={label} className={`text-center ${bg} rounded-lg p-2`}>
                            <p className={`text-[10px] ${sub} font-medium`}>{label}</p>
                            <p className={`text-lg font-bold ${color} mt-0.5`}>{val}</p>
                          </div>
                        ))}
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
