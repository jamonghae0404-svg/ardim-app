// =====================================================
// 공유 저장소 타입 & 키
// admin / attendance 페이지가 동일한 키로 데이터를 공유합니다.
// =====================================================

export const STORAGE_KEYS = {
  PROGRAMS:   "welfare-programs",
  MEMBERS:    "welfare-members",
  ATTENDANCE: "welfare-attendance",
} as const;

// ── 타입 ──────────────────────────────────────────────
export type AttendanceStatus = "present" | "absent" | "unset";

export interface Program {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  programId: string;
  programName: string;
  createdAt: string; // ISO: "2026-02-22"
}

// { [dateKey: "2026-02-22"]: { [memberId]: AttendanceStatus } }
export type AttendanceData = Record<string, Record<string, AttendanceStatus>>;

// ── 유틸 ──────────────────────────────────────────────
export function getTodayKey(): string {
  return new Date().toISOString().split("T")[0];
}

export function formatDateKR(iso: string): string {
  if (!iso) return "-";
  const [y, m, d] = iso.split("-");
  return `${y}. ${parseInt(m)}. ${parseInt(d)}.`;
}

export function calcStats(
  members: Member[],
  dayRecord: Record<string, AttendanceStatus> = {}
) {
  const present = members.filter((m) => dayRecord[m.id] === "present").length;
  const absent  = members.filter((m) => dayRecord[m.id] === "absent").length;
  const unset   = members.length - present - absent;
  const rate    = members.length > 0
    ? Math.round((present / members.length) * 100)
    : 0;
  return { total: members.length, present, absent, unset, rate };
}
