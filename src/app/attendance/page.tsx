"use client";

import { useState, useEffect } from "react";
import {
  ClipboardCheck, CheckCircle2, XCircle,
  HelpCircle, Users, TrendingUp, Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  getTodayKey, formatDateKR, calcStats,
  type Program, type Member, type AttendanceData, type AttendanceStatus,
} from "@/lib/storage";
import { fetchPrograms, fetchMembers, fetchAttendance, saveAttendance } from "@/lib/db";
import { useOperator } from "@/components/operator-provider";

// ── 출석 상태 버튼 ────────────────────────────────────
function StatusButtons({
  status,
  onToggle,
}: {
  status: AttendanceStatus;
  onToggle: (s: "present" | "absent") => void;
}) {
  return (
    <div className="flex gap-1.5">
      <button
        onClick={() => onToggle("present")}
        className={cn(
          "h-8 px-3 rounded-lg text-xs font-semibold transition-all",
          status === "present"
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
            : "bg-gray-100 text-gray-400 hover:bg-emerald-50 hover:text-emerald-500"
        )}
      >
        출석
      </button>
      <button
        onClick={() => onToggle("absent")}
        className={cn(
          "h-8 px-3 rounded-lg text-xs font-semibold transition-all",
          status === "absent"
            ? "bg-red-400 text-white shadow-sm shadow-red-200"
            : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-400"
        )}
      >
        결석
      </button>
    </div>
  );
}

// ── 단일 멤버 행 ──────────────────────────────────────
function MemberRow({
  index, member, status, onToggle,
}: {
  index: number;
  member: Member;
  status: AttendanceStatus;
  onToggle: (s: "present" | "absent") => void;
}) {
  const avatarBg =
    status === "present" ? "bg-emerald-100 text-emerald-600" :
    status === "absent"  ? "bg-red-100 text-red-500" :
    "bg-gray-100 text-gray-500";

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-300 w-5 text-right">{index + 1}</span>
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors", avatarBg)}>
          {member.name[0]}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">{member.name}</p>
          {member.phone && (
            <p className="text-[11px] text-gray-400">{member.phone}</p>
          )}
        </div>
      </div>
      <StatusButtons status={status} onToggle={onToggle} />
    </div>
  );
}

// ── 멤버 목록 ─────────────────────────────────────────
function MemberList({
  members, dayRecord, onToggle,
}: {
  members: Member[];
  dayRecord: Record<string, AttendanceStatus>;
  onToggle: (memberId: string, s: "present" | "absent") => void;
}) {
  if (members.length === 0) {
    return (
      <div className="py-12 text-center text-gray-400 text-sm">
        <Users className="h-8 w-8 mx-auto mb-2 text-gray-200" />
        <p>등록된 이용자가 없습니다.</p>
        <p className="text-xs mt-1 text-gray-300">관리자 페이지에서 이용자를 먼저 등록하세요.</p>
      </div>
    );
  }
  return (
    <div>
      {members.map((m, i) => (
        <MemberRow
          key={m.id}
          index={i}
          member={m}
          status={dayRecord[m.id] ?? "unset"}
          onToggle={(s) => onToggle(m.id, s)}
        />
      ))}
    </div>
  );
}

// ── 로딩 스피너 ───────────────────────────────────────
function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-7 w-7 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function AttendancePage() {
  const { operatorName } = useOperator();

  const [programs,       setPrograms]       = useState<Program[]>([]);
  const [members,        setMembers]        = useState<Member[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});
  const [selectedDate,   setSelectedDate]   = useState(getTodayKey());
  const [activeTab,      setActiveTab]      = useState("all");
  const [isLoading,      setIsLoading]      = useState(true);

  // ── Supabase 로드 ─────────────────────────────────
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

  // ── 출석 토글 (낙관적 업데이트 + Supabase 백그라운드 저장) ──
  const toggleStatus = (memberId: string, next: "present" | "absent") => {
    const current = attendanceData[selectedDate]?.[memberId] ?? "unset";
    const newStatus: AttendanceStatus = current === next ? "unset" : next;

    setAttendanceData((prev) => ({
      ...prev,
      [selectedDate]: { ...prev[selectedDate], [memberId]: newStatus },
    }));

    saveAttendance(operatorName, memberId, selectedDate, newStatus);
  };

  // ── 계산 ─────────────────────────────────────────
  const dayRecord      = attendanceData[selectedDate] ?? {};
  const membersForTab  = (tab: string) =>
    tab === "all" ? members : members.filter((m) => m.programId === tab);
  const activeMembers  = membersForTab(activeTab);
  const stats          = calcStats(activeMembers, dayRecord);
  const isToday        = selectedDate === getTodayKey();

  // ── 렌더 ─────────────────────────────────────────
  return (
    <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 space-y-4 max-w-5xl mx-auto w-full">

      {/* 헤더 */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-gray-900">출석체크</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {formatDateKR(selectedDate)}
            {isToday && (
              <span className="ml-2 text-[10px] bg-blue-100 text-blue-600 font-semibold px-1.5 py-0.5 rounded-full">
                오늘
              </span>
            )}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="h-9 px-3 text-sm rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-blue-400"
        />
      </div>

      {isLoading ? <Spinner /> : (
        <>
          {/* 통계 카드 */}
          <div className="grid grid-cols-4 gap-2 md:gap-3">
            <Card className="col-span-2 border-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200/50">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-[10px] font-semibold uppercase tracking-wide">출석률</p>
                  <p className="text-4xl font-bold mt-0.5">
                    {stats.rate}<span className="text-xl text-blue-200">%</span>
                  </p>
                  <p className="text-blue-200 text-[11px] mt-1">
                    {stats.total}명 중 {stats.present}명
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-white/50" />
              </CardContent>
            </Card>

            <Card className="border-0 bg-emerald-50 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 mb-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">출석</span>
                </div>
                <p className="text-3xl font-bold text-emerald-700">{stats.present}</p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-red-50 shadow-sm">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-1 mb-2">
                  <XCircle className="h-3 w-3 text-red-400" />
                  <span className="text-[10px] text-red-500 font-bold uppercase">결석</span>
                </div>
                <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 border-0 bg-gray-50 shadow-sm">
              <CardContent className="p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">미체크</span>
                </div>
                <span className="text-2xl font-bold text-gray-500">{stats.unset}</span>
              </CardContent>
            </Card>

            <Card className="col-span-2 border-0 bg-gray-50 shadow-sm">
              <CardContent className="p-3 md:p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium">전체 인원</span>
                </div>
                <span className="text-2xl font-bold text-gray-500">{stats.total}</span>
              </CardContent>
            </Card>
          </div>

          {/* 프로그램 탭 + 명단 */}
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader className="pb-0 px-5 pt-5">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <ClipboardCheck className="h-4 w-4 text-blue-500" />
                출석 명단
              </CardTitle>

              {programs.length === 0 ? (
                <div className="py-2 mb-1">
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    관리자 페이지에서 프로그램과 이용자를 먼저 등록해 주세요.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-1 pb-1">
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100 p-1 rounded-xl flex w-max gap-0.5">
                      <TabsTrigger
                        value="all"
                        className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                      >
                        전체
                        <span className="ml-1.5 text-[10px] bg-gray-200 data-[state=active]:bg-blue-100 px-1 rounded-full">
                          {members.length}
                        </span>
                      </TabsTrigger>
                      {programs.map((p) => {
                        const count = members.filter((m) => m.programId === p.id).length;
                        return (
                          <TabsTrigger
                            key={p.id}
                            value={p.id}
                            className="rounded-lg px-3 py-1.5 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
                          >
                            {p.name}
                            <span className="ml-1.5 text-[10px] bg-gray-200 px-1 rounded-full">
                              {count}
                            </span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    <TabsContent value="all" className="mt-0 pt-3">
                      <MemberList members={members} dayRecord={dayRecord} onToggle={toggleStatus} />
                    </TabsContent>
                    {programs.map((p) => (
                      <TabsContent key={p.id} value={p.id} className="mt-0 pt-3">
                        <MemberList
                          members={members.filter((m) => m.programId === p.id)}
                          dayRecord={dayRecord}
                          onToggle={toggleStatus}
                        />
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </CardHeader>

            {programs.length === 0 && (
              <CardContent className="px-5 pb-5">
                <MemberList members={[]} dayRecord={{}} onToggle={() => {}} />
              </CardContent>
            )}
          </Card>

          <p className="text-center text-[11px] text-gray-300 pb-2">
            <Calendar className="inline h-3 w-3 mr-1" />
            출석 기록은 Supabase에 실시간 저장됩니다.
          </p>
        </>
      )}
    </div>
  );
}
